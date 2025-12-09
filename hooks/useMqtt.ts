import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import moment from 'moment';
import { MQTT_CONFIG } from '@/constants/Config';

// Interface สำหรับข้อมูลกราฟ
export interface ChartDataPoint {
  value: number;
  label: string;
  fullDate: string;
}

export function useMqtt() {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);
  
  const [tempChartData, setTempChartData] = useState<ChartDataPoint[]>([]);
  const [humiChartData, setHumiChartData] = useState<ChartDataPoint[]>([]);

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
          setTemp(data.temp);
          setHumi(data.humi);
          
          // --- LOGIC เก็บกราฟ 5 ชั่วโมง ---
          const now = Date.now();
          const UPDATE_INTERVAL = 60000; // เก็บทุก 1 นาที
          
          if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
            lastUpdateRef.current = now;
            const momentObj = moment();
            
            const newPoint = {
                label: momentObj.format('HH:mm'),
                fullDate: momentObj.format('D MMM, HH:mm')
            };

            // เก็บ 300 จุด (300 นาที = 5 ชั่วโมง)
            const MAX_POINTS = 300; 

            setTempChartData(prev => [...prev, { ...newPoint, value: data.temp }].slice(-MAX_POINTS));
            setHumiChartData(prev => [...prev, { ...newPoint, value: data.humi }].slice(-MAX_POINTS));
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