import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  style,
  textStyle,
  onPress,
  disabled,
  ...props
}) => {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const handlePress = (e: any) => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    onPress?.(e);
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: scheme === 'dark' ? '#27272a' : '#e2e8f0' },
          text: { color: theme.text },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.primary,
          },
          text: { color: theme.primary },
        };
      case 'danger':
        return {
          container: { backgroundColor: theme.danger },
          text: { color: '#ffffff' },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: theme.primary },
          text: { color: '#ffffff' },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
          text: { fontSize: 13, fontWeight: '700' },
        };
      case 'lg':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 18 },
          text: { fontSize: 16, fontWeight: '800' },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14 },
          text: { fontSize: 14, fontWeight: '700' },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.baseButton,
        vStyles.container,
        sStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color} size="small" />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[styles.baseText, vStyles.text, sStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  baseText: {
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
