import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions, ActivityIndicator } from 'react-native'; // ✅ เพิ่ม ActivityIndicator
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';

import { AnimatedToggle, PulseIndicator } from '@/components/CyberControls';
import DashboardCard from '@/components/DashboardCard';
import { Colors } from '@/constants/Colors';
import { useMqtt, ChartDataPoint } from '@/hooks/useMqtt';
import { getHomeStyles } from '@/styles/HomeStyles';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768; 
  const styles = getHomeStyles(isDesktop);
  
  // ✅ ดึง isLoading มาใช้ด้วย
  const { connectionStatus, temp, humi, isLightOn, tempChartData, humiChartData, toggleLight, isLoading } = useMqtt();
  
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  const chartWidth = width > 0 ? (isDesktop ? width - 120 : width - 60) : 300;

  // Tooltip
  const renderTooltip = (item: ChartDataPoint, color: string, unit: string) => {
    return (
      <View style={{
        backgroundColor: '#1E293B',
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8, 
        marginLeft: -10,
        minWidth: 110,
        zIndex: 1000,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
      }}>
        <Text style={{color: Colors.textSub, fontSize: 10, marginBottom: 2}}>{item.fullDate}</Text>
        <Text style={{color: Colors.text, fontSize: 16, fontWeight: 'bold'}}>
          {Number(item.value).toFixed(1)} <Text style={{color: color, fontSize: 12}}>{unit}</Text>
        </Text>
      </View>
    );
  };

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

        {/* 1. MONITORING (บน) */}
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

        {/* 2. SYSTEM CONTROL (กลาง - เพิ่ม Loading UI) */}
        <Text style={styles.sectionTitle}>SYSTEM CONTROL</Text>
        <View style={[styles.rowContainer, { zIndex: 2000, elevation: 10, position: 'relative' }]}>
            
            {/* กล่องซ้าย: ปุ่มสวิตช์ */}
            <DashboardCard style={styles.cardHalf}>
                <View style={styles.centeredContent}>
                    {/* ✅ ถ้ากำลังโหลด (isLoading) ให้โชว์ Spinner แทนปุ่ม */}
                    {isLoading ? (
                        <View style={{height: 50, justifyContent: 'center', alignItems: 'center'}}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={{color: Colors.textSub, fontSize: 10, marginTop: 8, letterSpacing: 1}}>CHECKING...</Text>
                        </View>
                    ) : (
                        <AnimatedToggle isOn={isLightOn} onToggle={toggleLight} scale={isDesktop ? 1.4 : 1.0} />
                    )}
                    
                    {/* ซ่อน label ตอนโหลด เพื่อความสะอาดตา */}
                    {!isLoading && <Text style={styles.smallLabel}>MANUAL SWITCH</Text>}
                </View>
            </DashboardCard>

            {/* กล่องขวา: สถานะจริง */}
            <DashboardCard style={styles.cardHalf}>
                <View style={styles.centeredContent}>
                    <PulseIndicator isOn={isLightOn} scale={isDesktop ? 1.2 : 0.9} />
                    <Text style={styles.smallLabel}>REAL-TIME CHECK</Text>
                </View>
            </DashboardCard>
        </View>

        {/* 3. HISTORY (ล่าง) */}
        <View style={{marginTop: 8, paddingBottom: 20, zIndex: 1}}>
            <Text style={styles.sectionTitle}>ANALYTICS (AUTO FIT)</Text>
            
            {/* กราฟ Temp */}
            <DashboardCard title="TEMPERATURE TREND">
                <View style={{paddingVertical: 10, alignItems: 'center', paddingRight: 0}}> 
                  <LineChart
                    data={tempChartData.length > 0 ? tempChartData : [{value: 0, label: '', fullDate: ''}]}
                    adjustToWidth={true} 
                    parentWidth={chartWidth}
                    width={chartWidth}
                    height={180}
                    color={Colors.chartTemp}
                    thickness={3}
                    dataPointsColor={Colors.chartTemp}
                    startFillColor="rgba(16, 185, 129, 0.2)"
                    endFillColor="rgba(16, 185, 129, 0.01)"
                    startOpacity={0.9} endOpacity={0.1}
                    noOfSections={4}
                    formatYLabel={(value) => parseFloat(value).toFixed(1)}
                    yAxisTextStyle={{color: Colors.textSub, fontSize: 10}}
                    xAxisLabelTextStyle={{color: Colors.textSub, fontSize: 10}}
                    rulesColor="rgba(255,255,255,0.1)"
                    backgroundColor="transparent"
                    curved
                    pointerConfig={{
                      pointerStripHeight: 140, pointerStripColor: Colors.chartTemp, pointerStripWidth: 2,
                      pointerColor: Colors.chartTemp, radius: 6,
                      pointerComponent: () => <View style={{height: 12, width: 12, borderRadius: 6, backgroundColor: Colors.chartTemp, borderWidth: 2, borderColor: 'white'}}/>,
                      pointerLabelComponent: (items: any) => renderTooltip(items[0], Colors.chartTemp, '°C'),
                      autoAdjustPointerLabelPosition: true, snapToPoint: true, activatePointersOnLongPress: false,
                    }}
                  />
                </View>
            </DashboardCard>

            {/* กราฟ Humidity */}
            <DashboardCard title="HUMIDITY TREND">
                <View style={{paddingVertical: 10, alignItems: 'center', paddingRight: 0}}>
                  <LineChart
                    data={humiChartData.length > 0 ? humiChartData : [{value: 0, label: '', fullDate: ''}]}
                    adjustToWidth={true} 
                    parentWidth={chartWidth}
                    width={chartWidth}
                    height={180}
                    color={Colors.chartHumi}
                    thickness={3}
                    dataPointsColor={Colors.chartHumi}
                    startFillColor="rgba(14, 165, 233, 0.2)"
                    endFillColor="rgba(14, 165, 233, 0.01)"
                    startOpacity={0.9} endOpacity={0.1}
                    noOfSections={4}
                    formatYLabel={(value) => parseFloat(value).toFixed(1)}
                    yAxisTextStyle={{color: Colors.textSub, fontSize: 10}}
                    xAxisLabelTextStyle={{color: Colors.textSub, fontSize: 10}}
                    rulesColor="rgba(255,255,255,0.1)"
                    backgroundColor="transparent"
                    curved
                    pointerConfig={{
                      pointerStripHeight: 140, pointerStripColor: Colors.chartHumi, pointerStripWidth: 2,
                      pointerColor: Colors.chartHumi, radius: 6,
                      pointerComponent: () => <View style={{height: 12, width: 12, borderRadius: 6, backgroundColor: Colors.chartHumi, borderWidth: 2, borderColor: 'white'}}/>,
                      pointerLabelComponent: (items: any) => renderTooltip(items[0], Colors.chartHumi, '%'),
                      autoAdjustPointerLabelPosition: true, snapToPoint: true, activatePointersOnLongPress: false,
                    }}
                  />
                </View>
            </DashboardCard>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}