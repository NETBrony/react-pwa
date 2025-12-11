import React, { useState, useEffect } from 'react';
import { View, Text, useWindowDimensions, ScrollView } from 'react-native';
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
  
  const { connectionStatus, temp, humi, isLightOn, tempChartData, humiChartData, toggleLight } = useMqtt();
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ไม่ต้องคำนวณ width แบบเป๊ะๆ แล้ว เพราะเราจะใช้ Scrollable
  const chartHeight = 220;

  // --- Tooltip Style ---
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
        marginBottom: 10, 
        marginLeft: -10, // จัดกึ่งกลาง
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

        {/* 1. MONITORING */}
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

        {/* 2. SYSTEM CONTROL */}
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

        {/* 3. HISTORY (แก้ใหม่หมดเพื่อให้ Scroll ได้) */}
        <View style={{marginTop: 8, paddingBottom: 20}}>
            <Text style={styles.sectionTitle}>ANALYTICS (SCROLLABLE)</Text>
            
            {/* กราฟ Temp */}
            <DashboardCard title="TEMPERATURE TREND">
                {/* overflow: hidden เพื่อให้กราฟอยู่ในการ์ด */}
                <View style={{paddingVertical: 10, marginLeft: -10, overflow: 'hidden'}}> 
                  <LineChart
                    data={tempChartData.length > 0 ? tempChartData : [{value: 0, label: '', fullDate: ''}]}
                    height={chartHeight}
                    
                    // --- 🚀 KEY FEATURES: ทำให้เลื่อนดูประวัติได้ ---
                    scrollable={true} // เปิดให้เลื่อนซ้ายขวา
                    scrollToEnd={true} // เริ่มต้นที่จุดล่าสุด (ขวาสุด)
                    initialSpacing={20} 
                    spacing={40} // ระยะห่างระหว่างจุด (ยิ่งเยอะยิ่งลากสนุก)
                    
                    color={Colors.chartTemp}
                    thickness={3}
                    dataPointsColor={Colors.chartTemp}
                    startFillColor="rgba(16, 185, 129, 0.2)"
                    endFillColor="rgba(16, 185, 129, 0.01)"
                    startOpacity={0.9}
                    endOpacity={0.1}
                    noOfSections={4}
                    // แกน Y
                    formatYLabel={(value) => parseFloat(value).toFixed(1)}
                    yAxisTextStyle={{color: Colors.textSub, fontSize: 10}}
                    xAxisLabelTextStyle={{color: Colors.textSub, fontSize: 10}}
                    rulesColor="rgba(255,255,255,0.1)"
                    backgroundColor="transparent"
                    curved
                    
                    // --- 🖱️ POINTER CONFIG (แก้ให้จิ้มติดง่าย) ---
                    pointerConfig={{
                      pointerStripHeight: 160,
                      pointerStripColor: Colors.chartTemp,
                      pointerStripWidth: 2,
                      pointerColor: Colors.chartTemp,
                      radius: 6,
                      // ✅ สำคัญ: ให้ Tooltip ค้างไว้แม้ปล่อยมือ
                      persistPointer: true, 
                      pointerComponent: (items: any) => (
                        <View style={{height: 12, width: 12, borderRadius: 6, backgroundColor: Colors.chartTemp, borderWidth: 2, borderColor: 'white'}}/>
                      ),
                      pointerLabelComponent: (items: any) => renderTooltip(items[0], Colors.chartTemp, '°C'),
                      autoAdjustPointerLabelPosition: true,
                      snapToPoint: true,
                    }}
                  />
                </View>
            </DashboardCard>

            {/* กราฟ Humidity */}
            <DashboardCard title="HUMIDITY TREND">
                <View style={{paddingVertical: 10, marginLeft: -10, overflow: 'hidden'}}>
                  <LineChart
                    data={humiChartData.length > 0 ? humiChartData : [{value: 0, label: '', fullDate: ''}]}
                    height={chartHeight}
                    
                    // --- ตั้งค่าเหมือนกัน ---
                    scrollable={true}
                    scrollToEnd={true}
                    initialSpacing={20}
                    spacing={40}

                    color={Colors.chartHumi}
                    thickness={3}
                    dataPointsColor={Colors.chartHumi}
                    startFillColor="rgba(14, 165, 233, 0.2)"
                    endFillColor="rgba(14, 165, 233, 0.01)"
                    startOpacity={0.9}
                    endOpacity={0.1}
                    noOfSections={4}
                    formatYLabel={(value) => parseFloat(value).toFixed(1)}
                    yAxisTextStyle={{color: Colors.textSub, fontSize: 10}}
                    xAxisLabelTextStyle={{color: Colors.textSub, fontSize: 10}}
                    rulesColor="rgba(255,255,255,0.1)"
                    backgroundColor="transparent"
                    curved
                    pointerConfig={{
                      pointerStripHeight: 160,
                      pointerStripColor: Colors.chartHumi,
                      pointerStripWidth: 2,
                      pointerColor: Colors.chartHumi,
                      radius: 6,
                      persistPointer: true, // ✅ จิ้มแล้วค้างไว้
                      pointerComponent: (items: any) => (
                        <View style={{height: 12, width: 12, borderRadius: 6, backgroundColor: Colors.chartHumi, borderWidth: 2, borderColor: 'white'}}/>
                      ),
                      pointerLabelComponent: (items: any) => renderTooltip(items[0], Colors.chartHumi, '%'),
                      autoAdjustPointerLabelPosition: true,
                      snapToPoint: true,
                    }}
                  />
                </View>
            </DashboardCard>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}