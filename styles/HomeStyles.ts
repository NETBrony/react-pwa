import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const getHomeStyles = (isDesktop: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 50 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  logoBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(14, 165, 233, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  brandText: { color: Colors.text, fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  dateText: { color: Colors.textSub, fontSize: 13, marginTop: 2 },
  timeText: { color: Colors.text, fontSize: 36, fontWeight: 'bold', lineHeight: 40 },
  seconds: { fontSize: 18, color: Colors.textSub, fontWeight: 'normal' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginTop: 4, alignSelf: 'flex-end' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },

  // Grid Layout
  gridContainer: { 
    flexDirection: isDesktop ? 'row' : 'column', 
    gap: 16, 
    marginBottom: 16, 
    minHeight: isDesktop ? 200 : undefined 
  },
  cardHalf: { flex: isDesktop ? 1 : 0, width: isDesktop ? undefined : '100%' },

  // --- Control Row (ปรับแก้ระยะห่าง) ---
  controlRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%',
    
    // 🔧 Desktop: ลดเหลือ 24 (ให้ชิดกันมากๆ ตามที่ขอ)
    // 🔧 Mobile: ลดเหลือ 16 (ให้กระชับ ไม่ห่างเกินไป)
    gap: isDesktop ? 24 : 16, 
    
    // เพิ่มพื้นที่แนวตั้งให้ Mobile
    paddingVertical: isDesktop ? 0 : 20 
  },
  
  divider: { 
    width: 1, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    // ลดความสูงเส้นคั่นลงให้พอดีกับปุ่มไซส์เล็ก
    height: isDesktop ? 50 : 30 
  },
  
  controlItem: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  smallLabel: { 
    fontSize: 10, 
    color: Colors.textSub, 
    marginTop: 8, 
    letterSpacing: 0.5, 
    fontWeight: '600' 
  },

  // Sensors
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingVertical: 10 },
  sensorIconBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  sensorTitle: { color: Colors.textSub, fontSize: isDesktop ? 14 : 11, fontWeight: 'bold', marginLeft: 8, letterSpacing: 1 },
  bigValue: { fontWeight: 'bold', textAlign: 'center', lineHeight: 60, fontSize: isDesktop ? 56 : 36 },

  // Charts
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 12, marginLeft: 4, borderLeftWidth: 4, borderLeftColor: Colors.primary, paddingLeft: 12 },
  chart: { marginVertical: 8, borderRadius: 16 }
});