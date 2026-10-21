import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthHeroBannerProps {
  type?: 'login' | 'signup';
}

export const AuthHeroBanner: React.FC<AuthHeroBannerProps> = ({ type = 'login' }) => {
  const imageSource =
    type === 'signup'
      ? require('../../../assets/images/signup-bg.png')
      : require('../../../assets/images/login-bg.png');

  return (
    <View style={styles.container}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* Gradient Dark Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(2, 6, 23, 0.4)', 'rgba(2, 6, 23, 0.95)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />

      {/* Floating Editorial Content */}
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🏛️ Lomar Inmobiliaria de Lujo</Text>
        </View>

        <Text style={styles.title}>
          Encuentra el hogar y la inversión de tus sueños
        </Text>

        <Text style={styles.subtitle}>
          Explora las propiedades más exclusivas de México, recorridos en Realidad Virtual 360° y gestiona tus inversiones de manera profesional.
        </Text>

        <View style={styles.highlights}>
          <View style={styles.highlightItem}>
            <View style={[styles.dot, { backgroundColor: '#34d399' }]} />
            <Text style={styles.highlightText}>+1,200 Propiedades verificadas</Text>
          </View>
          <View style={styles.highlightItem}>
            <View style={[styles.dot, { backgroundColor: '#f97316' }]} />
            <Text style={styles.highlightText}>Recorridos VR 360°</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1.2,
    minHeight: '100%',
    position: 'relative',
    backgroundColor: '#020617',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 48,
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: 540,
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fdba74',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(226, 232, 240, 0.9)',
    lineHeight: 24,
  },
  highlights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
  },
});
