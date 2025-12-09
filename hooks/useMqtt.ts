import { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import moment from 'moment';
import { MQTT_CONFIG } from '@/constants/Config';

export function useMqtt() {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [temp, setTemp] = useState(0);
  const [humi, setHumi] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);
  
  const [chartLabels, setChartLabels] = useState<string[]>(['00:00']);
  const [tempData, setTempData] = useState<number[]>([0]);
  const [humiData, setHumiData] = useState<number[]>([0]);

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
      } else if (topic === MQTT_CONFIG.topics.sensor) {
        try {
          const data = JSON.parse(payload);
          setTemp(data.temp);
          setHumi(data.humi);
          
          const timeNow = moment().format('HH:mm:ss');
          setChartLabels(prev => [...prev.slice(-5), timeNow]);
          setTempData(prev => [...prev.slice(-5), data.temp]);
          setHumiData(prev => [...prev.slice(-5), data.humi]);
        } catch (e) { console.error(e); }
      }
    });

    mqttClient.on('error', () => setConnectionStatus('Error'));
    setClient(mqttClient);
    return () => { if (mqttClient) mqttClient.end(); };
  }, []);

  const toggleLight = () => {
    if (client) client.publish(MQTT_CONFIG.topics.command, isLightOn ? '0' : '1');
  };

  return { connectionStatus, temp, humi, isLightOn, tempData, humiData, chartLabels, toggleLight };
}