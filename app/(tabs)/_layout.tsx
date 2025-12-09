import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // ซ่อน Header มาตรฐาน (เราทำเองแล้ว)
        tabBarStyle: {
          backgroundColor: Colors.cardBg, // สีพื้นหลังแถบเมนู
          borderTopColor: Colors.primary, // เส้นขอบบนสีฟ้า
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 60 : 60, // ความสูงแถบ
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary, // สีไอคอนตอนเลือก
        tabBarInactiveTintColor: Colors.textSub, // สีไอคอนตอนไม่เลือก
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
      }}>
      
      {/* 1. หน้า Dashboard (index) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={28} color={color} />
          ),
        }}
      />

      {/* 2. ซ่อนหน้าอื่นๆ ที่เราไม่ได้ใช้ (เช่น explore) */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // ซ่อนเมนูนี้
        }}
      />
    </Tabs>
  );
}