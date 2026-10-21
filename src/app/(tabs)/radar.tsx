import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';

export default function RadarScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const [radius, setRadius] = useState(5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Radar Inmobiliario</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Descubre oportunidades y plusvalía cerca de tu ubicación
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <View style={styles.radarIconBox}>
          <Ionicons name="radio" size={48} color={theme.primary} />
        </View>

        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Escaneo Inteligente en {radius} km
        </Text>
        <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
          El radar monitorea nuevos lanzamientos, bajas de precio y oportunidades para compradores y vendedores.
        </Text>

        <View style={styles.radiusSelector}>
          {[3, 5, 10, 20].map((km) => (
            <TouchableOpacity
              key={km}
              onPress={() => setRadius(km)}
              style={[
                styles.kmChip,
                radius === km
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.background, borderColor: theme.cardBorder },
              ]}
            >
              <Text
                style={[
                  styles.kmChipText,
                  { color: radius === km ? '#ffffff' : theme.textSecondary },
                ]}
              >
                {km} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Activar Alertas de Radar"
          variant="primary"
          icon={<Ionicons name="notifications" size={16} color="#ffffff" />}
          onPress={() => alert('Radar activado para tu zona')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
  },
  radarIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  radiusSelector: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  kmChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  kmChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
