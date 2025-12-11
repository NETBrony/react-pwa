import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import moment from 'moment';
// 1. Import Storage
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { MQTT_CONFIG } from '@/constants/Config';

export interface ChartDataPoint {
  value: number;
  label: string;
  fullDate: string;
  dataPointText?: string;
}

export function useMqtt() {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  
  // Real-time Data
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);
  
  // Chart Data
  const [tempChartData, setTempChartData] = useState<ChartDataPoint[]>([]);
  const [humiChartData, setHumiChartData] = useState<ChartDataPoint[]>([]);

  const lastUpdateRef = useRef<number>(0); 

  // --- ฟังก์ชันโหลดข้อมูลเก่าเมื่อเปิดแอพ (Load History) ---
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedTemp = await AsyncStorage.getItem('tempHistory');
        const savedHumi = await AsyncStorage.getItem('humiHistory');
        
        if (savedTemp) setTempChartData(JSON.parse(savedTemp));
        if (savedHumi) setHumiChartData(JSON.parse(savedHumi));
      } catch (e) {
        console.log('Failed to load history', e);
      }
    };
    loadHistory();
  }, []);

  // --- เชื่อมต่อ MQTT ---
  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_CONFIG.host, MQTT_CONFIG.options);

    mqttClient.on('connect', () => {
      setConnectionStatus('Connected');
      mqttClient.subscribe(MQTT_CONFIG.topics.status);
      mqttClient.subscribe(MQTT_CONFIG.topics.sensor);
    });

    mqttClient.on('message', (topic, message) => {
      const payload = message.toString();

      if (topic === MQTT_CONFIG.topics.status) {
        setIsLightOn(payload === '1');
      } 
      else if (topic === MQTT_CONFIG.topics.sensor) {
        try {
          const data = JSON.parse(payload);
          // อัพเดต Real-time
          setTemp(data.temp);
          setHumi(data.humi);
          
          // --- LOGIC กราฟ + บันทึกข้อมูล (Save History) ---
          const now = Date.now();
          const UPDATE_INTERVAL = 60000; // 1 นาที
          
          if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
            lastUpdateRef.current = now;
            const momentObj = moment();
            
            const newPoint = {
                label: momentObj.format('HH:mm'),
                fullDate: momentObj.format('D MMM, HH:mm')
            };

            const MAX_POINTS = 300; // เก็บ 5 ชม. (300 จุด)

            // อัพเดต State และ Save ลงเครื่องพร้อมกัน
            setTempChartData(prev => {
                const newData = [...prev, { ...newPoint, value: data.temp }].slice(-MAX_POINTS);
                AsyncStorage.setItem('tempHistory', JSON.stringify(newData)); // 💾 บันทึก Temp
                return newData;
            });

            setHumiChartData(prev => {
                const newData = [...prev, { ...newPoint, value: data.humi }].slice(-MAX_POINTS);
                AsyncStorage.setItem('humiHistory', JSON.stringify(newData)); // 💾 บันทึก Humi
                return newData;
            });
          }

        } catch (e) {
          console.error("JSON Error", e);
        }
      }
    });

    mqttClient.on('error', () => setConnectionStatus('Error'));
    setClient(mqttClient);
    return () => { if (mqttClient) mqttClient.end(); };
  }, []);

  const toggleLight = () => {
    if (client) client.publish(MQTT_CONFIG.topics.command, isLightOn ? '0' : '1');
  };

  return { connectionStatus, temp, humi, isLightOn, tempChartData, humiChartData, toggleLight };
}