import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import DashboardCard from '@/components/DashboardCard';
import { useMqtt } from '@/hooks/useMqtt';
import { AnimatedToggle, PulseIndicator } from '@/components/CyberControls';
import { getHomeStyles } from '@/styles/HomeStyles'; // Import Style

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768; 
  const styles = getHomeStyles(isDesktop); // Load Style
  
  const { connectionStatus, temp, humi, isLightOn, tempData, humiData, chartLabels, toggleLight } = useMqtt();
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  const chartConfig = (color: string) => ({
    backgroundGradientFrom: Colors.cardBg, backgroundGradientTo: Colors.cardBg,
    decimalPlaces: 1, color: (opacity = 1) => color, labelColor: () => Colors.textSub,
    propsForDots: { r: "4", strokeWidth: "2", stroke: Colors.background },
    propsForBackgroundLines: { strokeDasharray: "" }, strokeWidth: 3,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <View style={styles.logoBox}><MaterialCommunityIcons name="music-note" size={28} color={Colors.primary} /></View>
            <View><Text style={styles.brandText}>SMART FARM <Text style={{color: Colors.primary}}>PRO</Text></Text><Text style={styles.dateText}>{currentTime.format('D MMM YYYY')}</Text></View>
          </View>
          <View style={{alignItems: 'flex-end'}}>
             <Text style={styles.timeText}>{currentTime.format('HH:mm')}<Text style={styles.seconds}>{currentTime.format(':ss')}</Text></Text>
             <View style={[styles.badge, { backgroundColor: connectionStatus === 'Connected' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                <View style={[styles.dot, { backgroundColor: connectionStatus === 'Connected' ? Colors.success : Colors.danger }]} />
                <Text style={[styles.statusText, { color: connectionStatus === 'Connected' ? Colors.success : Colors.danger }]}>{connectionStatus}</Text>
             </View>
          </View>
        </View>

        {/* GRID CONTENT */}
        <View style={styles.gridContainer}>
          {/* Controls */}
          <DashboardCard title="SYSTEM CONTROL" style={[styles.cardHalf, {justifyContent: 'center'}]}>
             <View style={styles.controlRow}>
                <View style={styles.controlItem}><AnimatedToggle isOn={isLightOn} onToggle={toggleLight} scale={isDesktop ? 1.5 : 1.2} /></View>
                <View style={styles.divider} />
                <View style={styles.controlItem}><PulseIndicator isOn={isLightOn} scale={isDesktop ? 1.3 : 1.0} /><Text style={styles.smallLabel}>REAL-TIME CHECK</Text></View>
             </View>
          </DashboardCard>

          {/* Sensors */}
          <View style={[styles.cardHalf, { flexDirection: 'row', gap: 16 }]}>
             <DashboardCard style={{flex:1, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: Colors.success, borderWidth: 1}}>
                <View style={styles.centeredContent}>
                    <View style={styles.sensorIconBadge}><MaterialCommunityIcons name="thermometer" size={isDesktop ? 28 : 24} color={Colors.success} /><Text style={styles.sensorTitle}>TEMP</Text></View>
                    <Text style={[styles.bigValue, { color: Colors.success }]}>{temp.toFixed(1)}<Text style={{fontSize: isDesktop ? 24 : 16}}>°C</Text></Text>
                </View>
             </DashboardCard>
             <DashboardCard style={{flex:1, backgroundColor: 'rgba(14, 165, 233, 0.05)', borderColor: Colors.primary, borderWidth: 1}}>
                <View style={styles.centeredContent}>
                    <View style={styles.sensorIconBadge}><MaterialCommunityIcons name="water-percent" size={isDesktop ? 28 : 24} color={Colors.primary} /><Text style={styles.sensorTitle}>HUMIDITY</Text></View>
                    <Text style={[styles.bigValue, { color: Colors.primary }]}>{humi.toFixed(1)}<Text style={{fontSize: isDesktop ? 24 : 16}}>%</Text></Text>
                </View>
             </DashboardCard>
          </View>
        </View>

        {/* CHARTS */}
        <View style={{marginTop: 8}}>
            <Text style={styles.sectionTitle}>ANALYTICS</Text>
            <DashboardCard title="TEMPERATURE TREND">
            <LineChart data={{ labels: chartLabels, datasets: [{ data: tempData.length > 0 ? tempData : [0] }] }} width={width > 0 ? width - 48 : 300} height={240} chartConfig={chartConfig(Colors.chartTemp)} bezier style={styles.chart} withInnerLines={true} yAxisSuffix="°C" segments={4} />
            </DashboardCard>
            <DashboardCard title="HUMIDITY TREND">
            <LineChart data={{ labels: chartLabels, datasets: [{ data: humiData.length > 0 ? humiData : [0] }] }} width={width > 0 ? width - 48 : 300} height={240} chartConfig={chartConfig(Colors.chartHumi)} bezier style={styles.chart} withInnerLines={true} yAxisSuffix="%" segments={4} />
            </DashboardCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}