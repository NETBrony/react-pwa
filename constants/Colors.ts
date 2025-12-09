// constants/Colors.ts
const CyberTheme = {
  background: '#0F172A',
  cardBg: '#1E293B',
  primary: '#0EA5E9',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  text: '#F8FAFC',
  textSub: '#94A3B8',
  chartTemp: '#10B981',
  chartHumi: '#0EA5E9',
};

export const Colors = {
  light: CyberTheme,
  dark: CyberTheme,
  ...CyberTheme,
};