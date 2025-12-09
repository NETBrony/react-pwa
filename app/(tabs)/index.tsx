import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Rect, Text as TextSVG, Svg } from 'react-native-svg'; // จำเป็นสำหรับ Tooltip

import { AnimatedToggle, PulseIndicator } from '@/components/CyberControls';
import DashboardCard from '@/components/DashboardCard';
import { Colors } from '@/constants/Colors';
import { useMqtt } from '@/hooks/useMqtt';
import { getHomeStyles } from '@/styles/HomeStyles';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768; 
  const styles = getHomeStyles(isDesktop);
  
  const { connectionStatus, temp, humi, isLightOn, tempData, humiData, chartLabels, toggleLight } = useMqtt();
  const [currentTime, setCurrentTime] = useState(moment());

  // State สำหรับ Tooltip (กดแล้วโชว์ค่า)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0, index: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  const chartWidth = width > 0 ? (isDesktop ? width - 48 : width - 32) : 300;

  const chartConfig = (color: string) => ({
    backgroundGradientFrom: Colors.cardBg, backgroundGradientTo: Colors.cardBg,
    decimalPlaces: 1, color: (opacity = 1) => color, labelColor: () => Colors.textSub,
    propsForDots: { r: "5", strokeWidth: "2", stroke: Colors.background },
    propsForBackgroundLines: { strokeDasharray: "" }, strokeWidth: 3,
  });

  // ฟังก์ชันวาด Tooltip
  const renderTooltip = () => {
      if (!tooltipPos.visible) return null;
      return (
          <View>
              <Svg>
                  <Rect x={tooltipPos.x - 30} y={tooltipPos.y - 40} width="60" height="35" fill={Colors.cardBg} stroke={Colors.primary} strokeWidth="1" rx="8" />
                  <TextSVG x={tooltipPos.x} y={tooltipPos.y - 23} fill={Colors.text} fontSize="12" fontWeight="bold" textAnchor="middle">{tooltipPos.value}</TextSVG>
                  <TextSVG x={tooltipPos.x} y={tooltipPos.y - 10} fill={Colors.textSub} fontSize="9" textAnchor="middle">{chartLabels[tooltipPos.index]}</TextSVG>
              </Svg>
          </View>
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} scrollEnabled={!tooltipPos.visible}>
        
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

        {/* 1. MONITORING (บนสุด) */}
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>MONITORING</Text>
        <View style={styles.rowContainer}>
             <DashboardCard style={[styles.cardHalf, { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: Colors.success, borderWidth: 1 }]}>
                <View style={styles.centeredContent}>
                    <View style={styles.sensorIconBadge}><MaterialCommunityIcons name="thermometer" size={24} color={Colors.success} /><Text style={styles.sensorTitle}>TEMP</Text></View>
                    <Text style={[styles.bigValue, { color: Colors.success }]}>{temp.toFixed(1)}<Text style={{fontSize: isDesktop ? 20 : 14}}>°C</Text></Text>
                </View>
             </DashboardCard>
             <DashboardCard style={[styles.cardHalf, { backgroundColor: 'rgba(14, 165, 233, 0.05)', borderColor: Colors.primary, borderWidth: 1 }]}>
                <View style={styles.centeredContent}>
                    <View style={styles.sensorIconBadge}><MaterialCommunityIcons name="water-percent" size={24} color={Colors.primary} /><Text style={styles.sensorTitle}>HUMIDITY</Text></View>
                    <Text style={[styles.bigValue, { color: Colors.primary }]}>{humi.toFixed(1)}<Text style={{fontSize: isDesktop ? 20 : 14}}>%</Text></Text>
                </View>
             </DashboardCard>
        </View>

        {/* 2. SYSTEM CONTROL (แยกกล่อง) */}
        <Text style={styles.sectionTitle}>SYSTEM CONTROL</Text>
        <View style={styles.rowContainer}>
            <DashboardCard style={styles.cardHalf}>
                <View style={styles.centeredContent}>
                    <AnimatedToggle isOn={isLightOn} onToggle={toggleLight} scale={isDesktop ? 1.4 : 1.0} />
                    <Text style={styles.smallLabel}>MANUAL SWITCH</Text>
                </View>
            </DashboardCard>
            <DashboardCard style={styles.cardHalf}>
                <View style={styles.centeredContent}>
                    <PulseIndicator isOn={isLightOn} scale={isDesktop ? 1.2 : 0.9} />
                    <Text style={styles.smallLabel}>REAL-TIME CHECK</Text>
                </View>
            </DashboardCard>
        </View>

        {/* 3. ANALYTICS (กราฟย้อนหลัง + Tooltip) */}
        <View style={{marginTop: 8}}>
            <Text style={styles.sectionTitle}>ANALYTICS (LAST HOUR)</Text>
            
            <DashboardCard title="TEMPERATURE TREND">
                <LineChart 
                    data={{ labels: chartLabels, datasets: [{ data: tempData.length > 0 ? tempData : [0] }] }} 
                    width={chartWidth} height={220} 
                    chartConfig={chartConfig(Colors.chartTemp)} 
                    bezier style={styles.chart} withInnerLines={true} yAxisSuffix="°C" segments={4} 
                    onDataPointClick={(data) => setTooltipPos({ x: data.x, y: data.y, value: data.value, index: data.index, visible: true })}
                    decorator={renderTooltip}
                />
            </DashboardCard>

            <DashboardCard title="HUMIDITY TREND">
                <LineChart 
                    data={{ labels: chartLabels, datasets: [{ data: humiData.length > 0 ? humiData : [0] }] }} 
                    width={chartWidth} height={220} 
                    chartConfig={chartConfig(Colors.chartHumi)} 
                    bezier style={styles.chart} withInnerLines={true} yAxisSuffix="%" segments={4} 
                    onDataPointClick={(data) => setTooltipPos({ x: data.x, y: data.y, value: data.value, index: data.index, visible: true })}
                    decorator={renderTooltip}
                />
            </DashboardCard>
            
            {/* กดเพื่อปิด Tooltip */}
            {tooltipPos.visible && <Text onPress={() => setTooltipPos({ ...tooltipPos, visible: false })} style={{textAlign:'center', color: Colors.textSub, marginTop: 10, padding: 10}}>[ Tap here to close tooltip ]</Text>}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}