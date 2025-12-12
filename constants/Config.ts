// src/constants/Config.ts

export const MQTT_CONFIG = {
  // HiveMQ Host (ไม่ต้องมี wss://)
  host: 'e53e2233d1a141699f1204a648c861c2.s1.eu.hivemq.cloud',
  
  // Port สำหรับ WSS (Secure WebSocket)
  port: 8884,
  
  // Path บังคับ
  path: '/mqtt',
  
  // Protocol
  protocol: 'wss',

  options: {
    clientId: 'react_pwa_' + Math.random().toString(16).substring(2, 8),
    username: 'netbrony',      
    password: 'Net_112233', 
    keepalive: 60,
    clean: true,
    reconnectPeriod: 2000,
    connectTimeout: 30 * 1000,
    useSSL: true, // สำคัญมาก
  },
  
  topics: {
    status: 'sensor/light_status', // รับสถานะไฟจริง
    sensor: 'sensor/TempHumi',     // รับค่า Sensor
    control: 'api/control',        // ส่งคำสั่ง (ต้องตรงกับใน ESP32)
  }
};