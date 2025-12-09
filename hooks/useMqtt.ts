import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import moment from 'moment';
import { MQTT_CONFIG } from '@/constants/Config';

export function useMqtt() {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);
  
  // เก็บข้อมูลกราฟ
  const [chartLabels, setChartLabels] = useState<string[]>(['00:00']);
  const [tempData, setTempData] = useState<number[]>([0]);
  const [humiData, setHumiData] = useState<number[]>([0]);

  // ตัวช่วยจำเวลาล่าสุดที่อัพเดตกราฟ
  const lastUpdateRef = useRef<number>(0); 

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
          
          // 1. อัพเดตตัวเลข Real-time ทันที (เพื่อให้เลขวิ่งตลอด)
          setTemp(data.temp);
          setHumi(data.humi);
          
          // 2. LOGIC กราฟ (เก็บแบบ Interval เพื่อดูยาวๆ)
          const now = Date.now();
          // 👇 ตั้งเวลาตรงนี้: 60000 = 1 นาที (เก็บ 1 จุดต่อนาที)
          // ถ้าอยากทดสอบเร็วๆ ให้แก้เป็น 5000 (5 วินาที)
          const UPDATE_INTERVAL = 60000; 
          
          if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
            lastUpdateRef.current = now;
            const timeNow = moment().format('HH:mm'); 

            // LIMIT: เก็บ 60 จุดล่าสุด (ถ้าเก็บทุก 1 นาที = ดูย้อนหลังได้ 1 ชั่วโมง)
            // ถ้าอยากได้ 5 ชม. ให้เพิ่มเป็น 300 จุด (แต่อาจจะหน่วงหน่อย)
            const MAX_POINTS = 60; 

            setChartLabels(prev => [...prev, timeNow].slice(-MAX_POINTS));
            setTempData(prev => [...prev, data.temp].slice(-MAX_POINTS));
            setHumiData(prev => [...prev, data.humi].slice(-MAX_POINTS));
          }

        } catch (e) {
          console.error("JSON Error", e);
        }
      }
    });

    mqttClient.on('error', (err) => {
      setConnectionStatus('Error');
    });

    setClient(mqttClient);
    return () => { if (mqttClient) mqttClient.end(); };
  }, []);

  const toggleLight = () => {
    if (client) {
      client.publish(MQTT_CONFIG.topics.command, isLightOn ? '0' : '1');
    }
  };

  return { connectionStatus, temp, humi, isLightOn, tempData, humiData, chartLabels, toggleLight };
}