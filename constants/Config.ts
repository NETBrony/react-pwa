export const MQTT_CONFIG = {
  // อย่าลืมเปลี่ยน IP เป็นของเครื่องคุณ
  host: 'ws://192.168.5.168:9001/mqtt', 
  options: {
    clientId: 'farm_pwa_' + Math.random().toString(16).substring(2, 8),
    keepalive: 60,
    username: 'netbrony',      // ตามที่คุณระบุ
    password: 'Net_112233', // <-- ใส่รหัสผ่านตรงนี้
  },
  topics: {
    command: 'test/light',
    status: 'sensor/light_status',
    sensor: 'sensor/TempHumi',
  }
};