// constants/Config.ts

export const MQTT_CONFIG = {
  // 1. Host: ต้องขึ้นต้นด้วย wss:// (Secure WebSocket) และจบด้วย /mqtt
  // Port ใช้ 8884 ตามที่ HiveMQ กำหนดสำหรับ WebSocket
  host: 'wss://e53e2233d1a141699f1204a648c861c2.s1.eu.hivemq.cloud:8884/mqtt', 
  
  options: {
    // Client ID สุ่มเลขเพื่อไม่ให้ชนกัน
    clientId: 'farm_pwa_' + Math.random().toString(16).substring(2, 8),
    
    // 2. ใส่ User/Pass ที่ตั้งไว้
    username: 'netbrony',      
    password: 'Net_112233', 
    
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    
    // สำคัญ: ตั้งค่า SSL
    useSSL: true,
    protocol: 'wss',
  },
  
  // Topic เดิมใช้งานได้เลย ไม่ต้องแก้
  topics: {
    status: 'sensor/light_status', // ฟังสถานะไฟ
    sensor: 'sensor/TempHumi',     // ฟังค่า Temp/Humi
    command: 'api/control',        // ส่งคำสั่งเปิดปิด (หรือจะเปลี่ยนเป็น topic mqtt ตรงๆ ก็ได้)
  }
};