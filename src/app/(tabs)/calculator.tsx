import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function CalculatorScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const params = useLocalSearchParams<{ price?: string }>();
  const [price, setPrice] = useState(params.price || '2500000');

  useEffect(() => {
    if (params.price) {
      setPrice(params.price);
    }
  }, [params.price]);
  const [downpaymentPercent, setDownpaymentPercent] = useState(10);
  const [selectedScenario, setSelectedScenario] = useState<'infonavit' | 'bancario1' | 'bancario2'>('bancario1');

  // Parámetros por tipo de crédito con ALIAS personalizables
  const [scenarios, setScenarios] = useState({
    infonavit: { name: 'Infonavit Total', rate: 10.45, termYears: 20, feePercent: 3 },
    bancario1: { name: 'BBVA Hipotecario', rate: 10.15, termYears: 20, feePercent: 1.0 },
    bancario2: { name: 'HSBC Premier', rate: 9.85, termYears: 20, feePercent: 0.0 },
  });

  const propertyPrice = parseFloat(price.replace(/\D/g, '')) || 0;
  const currentScenario = scenarios[selectedScenario];

  const downpaymentAmount = propertyPrice * (downpaymentPercent / 100);
  const loanAmount = Math.max(0, propertyPrice - downpaymentAmount);

  // Fórmula Francesa de Amortización Mensual
  const monthlyRate = currentScenario.rate / 100 / 12;
  const totalMonths = currentScenario.termYears * 12;
  const pmt =
    loanAmount > 0 && monthlyRate > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  // Seguros estimados al millar (~0.65 por millar)
  const insuranceMonthly = loanAmount * 0.00065;
  const totalMonthlyPayment = Math.round(pmt + insuranceMonthly);
  const minRequiredIncome = Math.round(totalMonthlyPayment / 0.35);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Simulador Hipotecario</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Compara Infonavit vs Bancos con amortización y alias ejecutivos
          </Text>
        </View>

        {/* Selector de Producto Hipotecario */}
        <View style={styles.scenarioTabs}>
          {(['infonavit', 'bancario1', 'bancario2'] as const).map((key) => {
            const active = selectedScenario === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedScenario(key)}
                style={[
                  styles.scenarioTab,
                  active
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <Text style={[styles.scenarioTabText, { color: active ? '#ffffff' : theme.textSecondary }]}>
                  {scenarios[key].name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Precio de la Propiedad */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>VALOR DE LA PROPIEDAD</Text>
          <View style={styles.priceInputRow}>
            <Text style={[styles.currencyPrefix, { color: theme.primary }]}>$</Text>
            <TextInput
              style={[styles.priceInput, { color: theme.text }]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Enganche Slider Rápido */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
            ENGANCHE: {downpaymentPercent}% ({formatCurrency(downpaymentAmount)})
          </Text>
          <View style={styles.downpaymentChips}>
            {[10, 15, 20, 30].map((pct) => (
              <TouchableOpacity
                key={pct}
                onPress={() => setDownpaymentPercent(pct)}
                style={[
                  styles.pctChip,
                  downpaymentPercent === pct
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.background, borderColor: theme.cardBorder },
                ]}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: downpaymentPercent === pct ? '#ffffff' : theme.textSecondary }}>
                  {pct}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resultado: Mensualidad Integral */}
        <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.primary }]}>
          <Text style={[styles.resultLabel, { color: theme.primary }]}>PAGO MENSUAL ESTIMADO</Text>
          <Text style={[styles.resultBigPrice, { color: theme.text }]}>
            {formatCurrency(totalMonthlyPayment)}
          </Text>
          <Text style={[styles.resultNote, { color: theme.textSecondary }]}>
            Incluye capital, intereses ordinarios y seguros de vida + daños
          </Text>

          <View style={[styles.breakdownBox, { backgroundColor: theme.background }]}>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownKey, { color: theme.textSecondary }]}>Institución:</Text>
              <Text style={[styles.breakdownVal, { color: theme.text }]}>{currentScenario.name}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownKey, { color: theme.textSecondary }]}>Tasa de Interés:</Text>
              <Text style={[styles.breakdownVal, { color: theme.text }]}>{currentScenario.rate}% Anual</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownKey, { color: theme.textSecondary }]}>Plazo:</Text>
              <Text style={[styles.breakdownVal, { color: theme.text }]}>{currentScenario.termYears} años</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownKey, { color: theme.textSecondary }]}>Monto a Financiar:</Text>
              <Text style={[styles.breakdownVal, { color: theme.text }]}>{formatCurrency(loanAmount)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownKey, { color: theme.textSecondary }]}>Ingreso Mínimo Sugerido:</Text>
              <Text style={[styles.breakdownVal, { color: theme.primary, fontWeight: '800' }]}>{formatCurrency(minRequiredIncome)} / mes</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    paddingVertical: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  scenarioTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  scenarioTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioTabText: {
    fontSize: 11,
    fontWeight: '800',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '900',
  },
  priceInput: {
    fontSize: 26,
    fontWeight: '900',
    flex: 1,
  },
  downpaymentChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pctChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    gap: 8,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  resultBigPrice: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  resultNote: {
    fontSize: 11,
    fontWeight: '500',
  },
  breakdownBox: {
    borderRadius: 16,
    padding: 14,
    gap: 8,
    marginTop: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownKey: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: '700',
  },
});
