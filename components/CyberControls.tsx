import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { controlStyles } from '@/styles/ComponentStyles'; // Import Style ที่แยกไว้

interface ControlProps { isOn: boolean; onToggle?: () => void; scale?: number; }

export const AnimatedToggle = ({ isOn, onToggle, scale = 1.2 }: ControlProps) => {
  const animValue = useRef(new Animated.Value(isOn ? 1 : 0)).current;
  const TRACK_W = 70 * scale; const TRACK_H = 36 * scale; const THUMB_SIZE = 30 * scale;
  
  useEffect(() => {
    Animated.timing(animValue, { toValue: isOn ? 1 : 0, duration: 300, useNativeDriver: false }).start();
  }, [isOn]);

  const translateX = animValue.interpolate({ inputRange: [0, 1], outputRange: [2 * scale, TRACK_W - THUMB_SIZE - (4 * scale)] });
  const backgroundColor = animValue.interpolate({ inputRange: [0, 1], outputRange: [Colors.cardBg, Colors.primary] });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={controlStyles.container}>
      <Animated.View style={[controlStyles.track, { width: TRACK_W, height: TRACK_H, borderRadius: TRACK_H/2, backgroundColor, borderColor: Colors.primary, borderWidth: 2 }]}>
        <Animated.View style={[controlStyles.thumb, { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE/2, transform: [{ translateX }] }]}>
           <MaterialCommunityIcons name="power" size={18 * scale} color={isOn ? Colors.primary : "#999"} />
        </Animated.View>
      </Animated.View>
      <Text style={[controlStyles.label, { fontSize: 10 * scale, color: isOn ? Colors.primary : Colors.textSub }]}>{isOn ? "ACTIVE" : "STANDBY"}</Text>
    </TouchableOpacity>
  );
};

export const PulseIndicator = ({ isOn, scale = 1.2 }: ControlProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  // 👇 กำหนดขนาดแยกกันตรงนี้ครับ (ปรับเลขได้ตามใจชอบเลย)
  const OUTER_SIZE = 55 * scale; // ขนาดวงแหวนชั้นนอก (ลดเลขนี้ลงถ้าอยากให้วงเล็กลง)
  const INNER_SIZE = 45 * scale; // ขนาดวงกลมชั้นใน (คงเลขนี้ไว้เท่าเดิมไอคอนจะได้ไม่หด)

  useEffect(() => {
    if (isOn) {
      Animated.loop(Animated.parallel([
          Animated.sequence([Animated.timing(scaleAnim, { toValue: 1.2, duration: 1500, useNativeDriver: false }), Animated.timing(scaleAnim, { toValue: 1, duration: 1500, useNativeDriver: false })]),
          Animated.sequence([Animated.timing(opacityAnim, { toValue: 0.6, duration: 1500, useNativeDriver: false }), Animated.timing(opacityAnim, { toValue: 0.2, duration: 1500, useNativeDriver: false })])
      ])).start();
    } else { scaleAnim.setValue(1); opacityAnim.setValue(0); }
  }, [isOn]);

  return (
    // ใช้ OUTER_SIZE เป็นกล่องหลัก
    <View style={[controlStyles.container, { width: OUTER_SIZE, height: OUTER_SIZE }]}>
      
      {/* วงแหวนชั้นนอก (ใช้ OUTER_SIZE) */}
      <Animated.View style={[controlStyles.glowRing, { 
          width: OUTER_SIZE, height: OUTER_SIZE, borderRadius: OUTER_SIZE/2, 
          transform: [{ scale: scaleAnim }], opacity: opacityAnim, 
          backgroundColor: isOn ? Colors.success : 'transparent' 
      }]} />
      
      {/* วงกลมชั้นใน (ใช้ INNER_SIZE) */}
      <View style={{ 
          width: INNER_SIZE, height: INNER_SIZE, borderRadius: INNER_SIZE/2, 
          backgroundColor: isOn ? Colors.success : 'rgba(255,255,255,0.05)', 
          alignItems: 'center', justifyContent: 'center', zIndex: 2 
      }}>
        <MaterialCommunityIcons name={isOn ? "lightbulb-on" : "lightbulb-off-outline"} size={32 * scale} color={isOn ? "#fff" : Colors.textSub} />
      </View>
    </View>
  );
};