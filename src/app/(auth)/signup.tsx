import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { LegalModal } from '@/components/legal/LegalModal';
import { AuthHeroBanner } from '@/components/auth/AuthHeroBanner';

export default function SignupScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const router = useRouter();
  const { register, user, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  // Si ya tiene sesión iniciada, redirigir al catálogo de propiedades inmediatamente
  React.useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)' as any);
    }
  }, [user, isLoading]);
  const [backendError, setBackendError] = useState('');

  // Legal Modal
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<'terms' | 'privacy'>('terms');

  const openLegalModal = (tab: 'terms' | 'privacy') => {
    Haptics.selectionAsync();
    setLegalInitialTab(tab);
    setLegalModalVisible(true);
  };

  const handleSignup = async () => {
    setBackendError('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setBackendError('El nombre completo debe tener al menos 3 caracteres');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setBackendError('Ingresa un correo electrónico válido');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!password || password.length < 6) {
      setBackendError('La contraseña debe tener al menos 6 caracteres');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (password !== confirmPassword) {
      setBackendError('Las contraseñas no coinciden');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!acceptedTerms) {
      setBackendError('Debes aceptar las Condiciones del Servicio y Política de Privacidad');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const res = await register({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      password,
    });

    setLoading(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)' as any);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setBackendError(res.error || 'No se pudo crear la cuenta');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={[styles.screenWrapper, isDesktop && styles.desktopSplit]}>
          {/* Left Form Column */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.formScrollContainer,
              isDesktop && styles.desktopFormContainer,
            ]}
          >
            <View style={styles.formInner}>
              {/* Top Bar: Back Link & Brand Logo */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={[styles.backButton, { backgroundColor: theme.card }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (router.canGoBack()) router.back();
                    else router.replace('/' as any);
                  }}
                >
                  <Ionicons name="arrow-back" size={18} color={theme.text} />
                  <Text style={[styles.backText, { color: theme.textSecondary }]}>
                    Volver al inicio
                  </Text>
                </TouchableOpacity>

                <View style={styles.brandContainer}>
                  <View style={styles.brandIcon}>
                    <Ionicons name="business" size={16} color="#ffffff" />
                  </View>
                  <Text style={[styles.brandText, { color: theme.text }]}>Lomar</Text>
                </View>
              </View>

              {/* Header Title */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Crea tu cuenta
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Únete a nuestra exclusiva red inmobiliaria y encuentra tu espacio ideal
                </Text>
              </View>

              {/* Google Sign-Up */}
              <GoogleButton
                text="Registrarse con Google"
                onSuccess={() => {
                  router.replace('/(tabs)' as any);
                }}
                onError={(err) => setBackendError(err)}
              />

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
                <Text style={[styles.dividerText, { color: theme.textMuted }]}>
                  O COMPLETA TUS DATOS
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              </View>

              {/* Error Banner */}
              {backendError ? (
                <View style={[styles.errorBanner, { backgroundColor: '#fff1f2', borderColor: '#fecdd3' }]}>
                  <Ionicons name="alert-circle" size={18} color="#e11d48" />
                  <Text style={styles.errorText}>{backendError}</Text>
                </View>
              ) : null}

              {/* Form Fields */}
              <View style={styles.form}>
                {/* Full Name */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Nombre completo
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Ionicons name="person-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="Tu nombre y apellido"
                      placeholderTextColor={theme.textMuted}
                      value={fullName}
                      onChangeText={(val) => {
                        setFullName(val);
                        if (backendError) setBackendError('');
                      }}
                      autoCapitalize="words"
                      style={[styles.input, { color: theme.text }]}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Correo electrónico
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Ionicons name="mail-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor={theme.textMuted}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (backendError) setBackendError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[styles.input, { color: theme.text }]}
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Teléfono móvil (WhatsApp)
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Ionicons name="call-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="10 dígitos para contactarte"
                      placeholderTextColor={theme.textMuted}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      style={[styles.input, { color: theme.text }]}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Contraseña
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={theme.textMuted}
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        if (backendError) setBackendError('');
                      }}
                      secureTextEntry={!showPassword}
                      style={[styles.input, { color: theme.text }]}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        setShowPassword(!showPassword);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    Confirmar contraseña
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="Repite tu contraseña"
                      placeholderTextColor={theme.textMuted}
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        if (backendError) setBackendError('');
                      }}
                      secureTextEntry={!showConfirmPassword}
                      style={[styles.input, { color: theme.text }]}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Conditions Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAcceptedTerms(!acceptedTerms);
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: acceptedTerms ? theme.primary : theme.textMuted,
                        backgroundColor: acceptedTerms ? theme.primary : 'transparent',
                      },
                    ]}
                  >
                    {acceptedTerms && (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { color: theme.textSecondary }]}>
                    Acepto las{' '}
                    <Text
                      style={[styles.linkHighlight, { color: theme.primary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openLegalModal('terms');
                      }}
                    >
                      Condiciones del Servicio
                    </Text>{' '}
                    y la{' '}
                    <Text
                      style={[styles.linkHighlight, { color: theme.primary }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        openLegalModal('privacy');
                      }}
                    >
                      Política de Privacidad
                    </Text>
                    .
                  </Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <Button
                  title="Crear mi Cuenta"
                  loading={loading}
                  onPress={handleSignup}
                  style={styles.submitBtn}
                />

                {/* Login Switch Link */}
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.replace('/(auth)/login' as any);
                  }}
                >
                  <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                    ¿Ya tienes una cuenta?{' '}
                    <Text style={{ color: theme.primary, fontWeight: '900' }}>
                      Inicia sesión
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Trust Badge */}
                <View style={styles.trustBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                  <Text style={[styles.trustText, { color: theme.textMuted }]}>
                    Plataforma Inmobiliaria Segura Lomar © {new Date().getFullYear()}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Right Editorial Banner on Desktop (>= 900px) */}
          {isDesktop && <AuthHeroBanner type="signup" />}
        </View>
      </KeyboardAvoidingView>

      {/* Modal Legal */}
      <LegalModal
        visible={legalModalVisible}
        initialTab={legalInitialTab}
        onClose={() => setLegalModalVisible(false)}
        onAccept={() => setAcceptedTerms(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  desktopSplit: {
    flexDirection: 'row',
  },
  formScrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  desktopFormContainer: {
    flex: 1,
    maxWidth: 500,
    paddingHorizontal: 48,
  },
  formInner: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#e11d48',
  },
  form: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  linkHighlight: {
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    marginTop: 6,
    height: 52,
    borderRadius: 16,
  },
  switchButton: {
    alignSelf: 'center',
    marginTop: 6,
    paddingVertical: 4,
  },
  switchText: {
    fontSize: 13,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
