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

  const chartWidth = width > 0 ? (isDesktop ? width - 120 : width - 60) : 300;

  // --- ฟังก์ชันสร้าง Tooltip (ปรับปรุงใหม่ ไม่ให้ตกขอบ) ---
  const renderTooltip = (item: ChartDataPoint, color: string, unit: string) => {
    return (
      <View style={{
        // จัดตำแหน่งกล่องให้ลอยอยู่เหนือจุดพอดีๆ
        marginBottom: 20, 
        marginLeft: -20, // ขยับซ้ายหน่อยเพื่อให้ Center กับจุด
        backgroundColor: 'rgba(30, 41, 59, 0.95)', // สีพื้นหลังเข้มโปร่งแสงนิดๆ แบบ Node-RED
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 140, // กว้างพอสำหรับวันที่ยาวๆ
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 10,
        zIndex: 1000, // สำคัญ! ให้ลอยทับทุกอย่าง
      }}>
        {/* วันที่และเวลา */}
        <Text style={{color: Colors.textSub, fontSize: 11, marginBottom: 4, fontWeight: '600'}}>
          {item.fullDate}
        </Text>
        {/* ค่าตัวเลข (ทศนิยม 1 ตำแหน่ง) */}
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

        {/* 3. HISTORY (แก้ไขกราฟ) */}
        <View style={{marginTop: 8, paddingBottom: 20}}>
            <Text style={styles.sectionTitle}>ANALYTICS (5 HOURS)</Text>
            
            {/* กราฟ Temp */}
            <DashboardCard title="TEMPERATURE TREND">
                {/* เพิ่ม PaddingTop ตรงนี้ เพื่อเผื่อที่ให้ Tooltip ไม่โดนตัด */}
                <View style={{paddingTop: 40, paddingBottom: 10, marginLeft: -10, overflow: 'visible'}}> 
                  <LineChart
                    data={tempChartData.length > 0 ? tempChartData : [{value: 0, label: '', fullDate: ''}]}
                    width={chartWidth}
                    height={180}
                    color={Colors.chartTemp}
                    thickness={3}
                    dataPointsColor={Colors.chartTemp}
                    startFillColor="rgba(16, 185, 129, 0.2)"
                    endFillColor="rgba(16, 185, 129, 0.01)"
                    startOpacity={0.9}
                    endOpacity={0.1}
                    initialSpacing={20}
                    noOfSections={4}
                    // ปรับแต่งแกน Y ให้แสดงทศนิยม 1 ตำแหน่ง
                    formatYLabel={(value) => parseFloat(value).toFixed(1)} 
                    yAxisTextStyle={{color: Colors.textSub, fontSize: 10}}
                    xAxisLabelTextStyle={{color: Colors.textSub, fontSize: 10}}
                    rulesColor="rgba(255,255,255,0.1)"
                    backgroundColor="transparent"
                    curved
                    // Pointer Config
                    pointerConfig={{
                      pointerStripHeight: 140, // ลดความสูงเส้นลงหน่อย
                      pointerStripColor: Colors.chartTemp,
                      pointerStripWidth: 2,
                      pointerColor: Colors.chartTemp,
                      radius: 6,
                      // ใช้ renderTooltip ที่แก้แล้ว
                      pointerLabelComponent: (items: any) => renderTooltip(items[0], Colors.chartTemp, '°C'),
                    }}
                  />
                </View>
            </DashboardCard>

            {/* กราฟ Humidity */}
            <DashboardCard title="HUMIDITY TREND">
                {/* เพิ่ม PaddingTop ให้กราฟล่างด้วย */}
                <View style={{paddingTop: 40, paddingBottom: 10, marginLeft: -10, overflow: 'visible'}}>
                  <LineChart
                    data={humiChartData.length > 0 ? humiChartData : [{value: 0, label: '', fullDate: ''}]}
                    width={chartWidth}
                    height={180}
                    color={Colors.chartHumi}
                    thickness={3}
                    dataPointsColor={Colors.chartHumi}
                    startFillColor="rgba(14, 165, 233, 0.2)"
                    endFillColor="rgba(14, 165, 233, 0.01)"
                    startOpacity={0.9}
                    endOpacity={0.1}
                    initialSpacing={20}
                    noOfSections={4}
                    // ปรับแต่งแกน Y ให้แสดงทศนิยม 1 ตำแหน่ง
                    formatYLabel={(value) => parseFloat(value).toFixed(1)}
                    yAxisTextStyle={{color: Colors.textSub, fontSize: 10}}
                    xAxisLabelTextStyle={{color: Colors.textSub, fontSize: 10}}
                    rulesColor="rgba(255,255,255,0.1)"
                    backgroundColor="transparent"
                    curved
                    pointerConfig={{
                      pointerStripHeight: 140,
                      pointerStripColor: Colors.chartHumi,
                      pointerStripWidth: 2,
                      pointerColor: Colors.chartHumi,
                      radius: 6,
                      pointerLabelComponent: (items: any) => renderTooltip(items[0], Colors.chartHumi, '%'),
                    }}
                  />
                </View>
            </DashboardCard>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}