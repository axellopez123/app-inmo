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
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { LegalModal } from '@/components/legal/LegalModal';
import { AuthHeroBanner } from '@/components/auth/AuthHeroBanner';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const router = useRouter();
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState('');

  // Legal Modal State
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<'terms' | 'privacy'>('terms');

  const openLegalModal = (tab: 'terms' | 'privacy') => {
    Haptics.selectionAsync();
    setLegalInitialTab(tab);
    setLegalModalVisible(true);
  };

  const handleLogin = async () => {
    setBackendError('');
    if (!email.trim() || !password) {
      setBackendError('Por favor ingresa tu correo y contraseña');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const res = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/' as any);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setBackendError(res.error || 'Correo o contraseña incorrectos.');
    }
  };

  const handleForgotPassword = async () => {
    await WebBrowser.openBrowserAsync('https://inmobiliaria.arwax.pro/forgot-password');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={[styles.screenWrapper, isDesktop && styles.desktopSplit]}>
          {/* Left / Main Form Column */}
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
                  Bienvenido de nuevo
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Accede a tu cuenta para gestionar tus propiedades y favoritos
                </Text>
              </View>

              {/* Google Sign-In */}
              <GoogleButton
                text="Continuar con Google"
                onSuccess={() => {
                  if (router.canGoBack()) router.back();
                  else router.replace('/' as any);
                }}
                onError={(err) => setBackendError(err)}
              />

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
                <Text style={[styles.dividerText, { color: theme.textMuted }]}>
                  O CON TU CORREO
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
                {/* Email Field */}
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

                {/* Password Field */}
                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      Contraseña
                    </Text>
                    <TouchableOpacity onPress={handleForgotPassword}>
                      <Text style={[styles.forgotLink, { color: theme.primary }]}>
                        ¿Olvidaste tu contraseña?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.inputBox,
                      { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="••••••••"
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

                {/* Submit Button */}
                <Button
                  title="Iniciar sesión"
                  loading={loading}
                  onPress={handleLogin}
                  style={styles.submitBtn}
                />

                {/* Registration Switch Link */}
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.replace('/(auth)/signup' as any);
                  }}
                >
                  <Text style={[styles.switchText, { color: theme.textSecondary }]}>
                    ¿No tienes una cuenta aún?{' '}
                    <Text style={{ color: theme.primary, fontWeight: '900' }}>
                      Regístrate gratis
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Legal Notice */}
                <View style={[styles.legalContainer, { borderTopColor: theme.cardBorder }]}>
                  <Text style={[styles.legalText, { color: theme.textMuted }]}>
                    Al continuar, aceptas nuestras{' '}
                    <Text
                      style={[styles.legalLink, { color: theme.primary }]}
                      onPress={() => openLegalModal('terms')}
                    >
                      Condiciones del Servicio
                    </Text>{' '}
                    y nuestra{' '}
                    <Text
                      style={[styles.legalLink, { color: theme.primary }]}
                      onPress={() => openLegalModal('privacy')}
                    >
                      Política de Privacidad
                    </Text>
                    .
                  </Text>
                </View>

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
          {isDesktop && <AuthHeroBanner type="login" />}
        </View>
      </KeyboardAvoidingView>

      {/* Modal Legal */}
      <LegalModal
        visible={legalModalVisible}
        initialTab={legalInitialTab}
        onClose={() => setLegalModalVisible(false)}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
  },
  forgotLink: {
    fontSize: 11,
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
  legalContainer: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
  },
  legalText: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    fontWeight: '500',
  },
  legalLink: {
    fontWeight: '800',
    textDecorationLine: 'underline',
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
