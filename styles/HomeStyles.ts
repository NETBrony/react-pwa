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

  // --- Grid System (แยกกล่อง) ---
  rowContainer: {
    flexDirection: 'row',
    gap: 16, // ระยะห่างระหว่างกล่องซ้าย-ขวา
    marginBottom: 16,
  },
  cardHalf: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    height: isDesktop ? 180 : 160 
  },

  // Content Styles
  centeredContent: { alignItems: 'center', justifyContent: 'center' },
  sensorIconBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  sensorTitle: { color: Colors.textSub, fontSize: isDesktop ? 14 : 11, fontWeight: 'bold', marginLeft: 8, letterSpacing: 1 },
  bigValue: { fontWeight: 'bold', textAlign: 'center', lineHeight: 40, fontSize: isDesktop ? 48 : 36 },
  smallLabel: { fontSize: 10, color: Colors.textSub, marginTop: 12, letterSpacing: 0.5, fontWeight: '600', textAlign: 'center' },

  // Charts
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 12, marginLeft: 4, borderLeftWidth: 4, borderLeftColor: Colors.primary, paddingLeft: 12 },
  chart: { marginVertical: 8, borderRadius: 16 }
});