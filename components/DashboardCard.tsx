import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { cardStyles } from '@/styles/ComponentStyles'; // Import Style ที่แยกไว้

export default function DashboardCard({ title, children, style }: { title?: string, children: React.ReactNode, style?: ViewStyle | ViewStyle[] }) {
  return (
    <View style={[cardStyles.card, style]}>
      {title && <Text style={cardStyles.title}>{title}</Text>}
      <View style={cardStyles.content}>{children}</View>
    </View>
  );
}