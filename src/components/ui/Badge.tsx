import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'casa' | 'departamento' | 'terreno' | 'local' | 'status' | 'vendor' | 'default';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style, textStyle }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'casa':
        return { bg: '#059669', text: '#ffffff' }; // Emerald
      case 'departamento':
        return { bg: '#2563eb', text: '#ffffff' }; // Blue
      case 'terreno':
        return { bg: '#d97706', text: '#ffffff' }; // Amber
      case 'local':
        return { bg: '#9333ea', text: '#ffffff' }; // Purple
      case 'vendor':
        return { bg: '#7c3aed', text: '#ffffff' };
      case 'status':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
      default:
        return { bg: 'rgba(15, 23, 42, 0.8)', text: '#ffffff' };
    }
  };

  const badgeTheme = getBadgeStyle();

  return (
    <View style={[styles.container, { backgroundColor: badgeTheme.bg }, style]}>
      <Text style={[styles.text, { color: badgeTheme.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
