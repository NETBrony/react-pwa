import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 8,
  },
  title: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  content: { alignItems: 'center', justifyContent: 'center' }
});

export const controlStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  track: { justifyContent: 'center' },
  thumb: { 
    backgroundColor: '#fff', 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, elevation: 4
  },
  label: { marginTop: 8, fontWeight: 'bold', letterSpacing: 1 },
  glowRing: { position: 'absolute' }
});