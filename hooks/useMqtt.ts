import { useState, useEffect, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import moment from 'moment';
import { MQTT_CONFIG } from '@/constants/Config';

export interface ChartDataPoint {
  value: number;
  label: string;
  fullDate: string;
}

export function useMqtt() {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);
  
  // ✅ เพิ่ม State นี้: เพื่อบอกว่ากำลังรอผลจาก ESP32
  const [isLoading, setIsLoading] = useState(false);

  const [tempChartData, setTempChartData] = useState<ChartDataPoint[]>([]);
  const [humiChartData, setHumiChartData] = useState<ChartDataPoint[]>([]);
  const lastUpdateRef = useRef<number>(0); 

  // --- 1. Load History (เหมือนเดิม) ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://192.168.5.168:1880/api/history');
        const data = await response.json();
        if (Array.isArray(data)) {
            const fmtTemp = data.map((d: any) => ({ value: d.temp, label: moment(d.timestamp).format('HH:mm'), fullDate: moment(d.timestamp).format('D MMM, HH:mm') }));
            const fmtHumi = data.map((d: any) => ({ value: d.humi, label: moment(d.timestamp).format('HH:mm'), fullDate: moment(d.timestamp).format('D MMM, HH:mm') }));
            setTempChartData(fmtTemp);
            setHumiChartData(fmtHumi);
        }
      } catch (e) { console.log('History error:', e); }
    };
    fetchHistory();
  }, []);

  // --- 2. MQTT Logic ---
  useEffect(() => {
    const connectUrl = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`;
    const mqttClient = mqtt.connect(connectUrl, MQTT_CONFIG.options);

    mqttClient.on('connect', () => {
      setConnectionStatus('Connected');
      mqttClient.subscribe(MQTT_CONFIG.topics.status);
      mqttClient.subscribe(MQTT_CONFIG.topics.sensor);
    });

    mqttClient.on('message', (topic, message) => {
      const payload = message.toString();

      if (topic === MQTT_CONFIG.topics.status) {
         console.log("Feedback:", payload);
         // ✅ เมื่อได้รับผลจาก ESP32 ให้หยุดหมุน และอัพเดตปุ่ม
         setIsLightOn(payload === '1');
         setIsLoading(false); // หยุดโหลด
      } 
      else if (topic === MQTT_CONFIG.topics.sensor) {
        try {
          const data = JSON.parse(payload);
          setTemp(data.temp);
          setHumi(data.humi);
          
          const now = Date.now();
          if (now - lastUpdateRef.current > 60000) {
            lastUpdateRef.current = now;
            const newPoint = { label: moment().format('HH:mm'), fullDate: moment().format('D MMM, HH:mm') };
            const MAX_POINTS = 300; 
            setTempChartData(prev => [...prev, { ...newPoint, value: data.temp }].slice(-MAX_POINTS));
            setHumiChartData(prev => [...prev, { ...newPoint, value: data.humi }].slice(-MAX_POINTS));
          }
        } catch (e) {}
      }
    });

    mqttClient.on('error', () => setConnectionStatus('Error'));
    setClient(mqttClient);
    return () => { if (mqttClient) mqttClient.end(); };
  }, []);

  // --- 3. Toggle Function (Strict Mode + Loading) ---
  const toggleLight = () => {
    if (isLoading) return; // ถ้ากำลังหมุนอยู่ ห้ามกดซ้ำ

    const commandToSend = isLightOn ? '0' : '1';

    if (client && client.connected) {
      // ✅ เริ่มหมุนติ้วๆ (บอก User ว่ากำลังเช็คสาย...)
      setIsLoading(true);
      
      // ส่งคำสั่งไป ESP32
      client.publish(MQTT_CONFIG.topics.control, commandToSend);

      // Timeout: ถ้า 3 วิ แล้วเงียบ (สายขาด/เน็ตหลุด) ให้หยุดหมุน
      setTimeout(() => {
        setIsLoading((currentLoading) => {
            if (currentLoading) {
                console.warn("Timeout: No feedback from ESP32");
                return false; // หยุดหมุน
            }
            return false;
        });
      }, 3000);
      
    } else {
      console.warn('MQTT Not Connected');
    }
  };

  // ส่ง isLoading ออกไปให้ UI ใช้
  return { connectionStatus, temp, humi, isLightOn, tempChartData, humiChartData, toggleLight, isLoading };
}