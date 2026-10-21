import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  ScrollView,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { LegalModal } from '@/components/legal/LegalModal';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { user, isVendor, logout, login, register } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // State for unauthenticated mode
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [backendError, setBackendError] = useState('');

  // Legal Modal
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<'terms' | 'privacy'>('terms');

  const openLegalModal = (tab: 'terms' | 'privacy') => {
    Haptics.selectionAsync();
    setLegalInitialTab(tab);
    setLegalModalVisible(true);
  };

  const handleAuthSubmit = async () => {
    setBackendError('');

    if (authMode === 'login') {
      if (!email.trim() || !password) {
        setBackendError('Ingresa tu correo y contraseña');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }

      setAuthLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await login(email.trim().toLowerCase(), password);
      setAuthLoading(false);

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setBackendError(res.error || 'Correo o contraseña incorrectos');
      }
    } else {
      // Signup mode
      if (!fullName.trim() || fullName.trim().length < 3) {
        setBackendError('El nombre debe tener al menos 3 caracteres');
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
        setBackendError('Debes aceptar las Condiciones del Servicio y Privacidad');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }

      setAuthLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        password,
      });
      setAuthLoading(false);

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setBackendError(res.error || 'No se pudo crear la cuenta');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.desktopContainer,
        ]}
      >
        {user ? (
          /* ========================================================= */
          /* LOGGED IN USER PROFILE VIEW                               */
          /* ========================================================= */
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>Mi Cuenta</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Gestiona tus datos personales y actividad en Lomar
              </Text>
            </View>

            {/* User Card */}
            <View
              style={[
                styles.userCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {user.full_name}
                </Text>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                  {user.email}
                </Text>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: isVendor
                        ? 'rgba(168, 85, 247, 0.15)'
                        : 'rgba(249, 115, 22, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: isVendor ? '#a855f7' : theme.primary,
                    }}
                  >
                    ROL: {user.role?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Options */}
            <View
              style={[
                styles.menuCard,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
              ]}
            >
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push('/(tabs)/favorites' as any)}
              >
                <Ionicons name="heart-outline" size={20} color="#f43f5e" />
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Mis Propiedades Favoritas
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push('/(tabs)/calculator' as any)}
              >
                <Ionicons name="calculator-outline" size={20} color="#0284c7" />
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Simulador de Crédito Hipotecario
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>

              {isVendor && (
                <>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => router.push('/property/create' as any)}
                  >
                    <Ionicons name="add-circle" size={20} color={theme.primary} />
                    <Text
                      style={[
                        styles.menuText,
                        { color: theme.primary, fontWeight: '800' },
                      ]}
                    >
                      Publicar Nueva Propiedad
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() =>
                      WebBrowser.openBrowserAsync('https://inmobiliaria.arwax.pro/clients')
                    }
                  >
                    <Ionicons name="people-outline" size={20} color="#a855f7" />
                    <Text style={[styles.menuText, { color: theme.text }]}>
                      Gestión de Clientes / CRM
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => openLegalModal('terms')}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Términos y Condiciones / Privacidad
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Button
              title="Cerrar Sesión"
              variant="danger"
              onPress={handleLogout}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          /* ========================================================= */
          /* LUXURY AUTHENTICATION CARD (When logged out)              */
          /* ========================================================= */
          <View style={styles.authContainer}>
            {/* Lomar Brand Header */}
            <View style={styles.brandBadge}>
              <View style={styles.brandIcon}>
                <Ionicons name="business" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.brandText, { color: theme.text }]}>Lomar Inmobiliaria</Text>
            </View>

            <View style={styles.authHeader}>
              <Text style={[styles.authTitle, { color: theme.text }]}>
                {authMode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </Text>
              <Text style={[styles.authSub, { color: theme.textSecondary }]}>
                {authMode === 'login'
                  ? 'Accede a tus propiedades guardadas y cotizaciones'
                  : 'Únete a nuestra exclusiva red inmobiliaria'}
              </Text>
            </View>

            {/* Segmented Auth Switcher */}
            <View style={[styles.segmentedSwitch, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  authMode === 'login' && [styles.segmentActive, { backgroundColor: theme.primary }],
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAuthMode('login');
                  setBackendError('');
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: authMode === 'login' ? '#ffffff' : theme.textSecondary },
                  ]}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  authMode === 'signup' && [styles.segmentActive, { backgroundColor: theme.primary }],
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAuthMode('signup');
                  setBackendError('');
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: authMode === 'signup' ? '#ffffff' : theme.textSecondary },
                  ]}
                >
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            {/* Google Button */}
            <GoogleButton
              text={authMode === 'login' ? 'Continuar con Google' : 'Registrarse con Google'}
              onError={(err) => setBackendError(err)}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerText, { color: theme.textMuted }]}>
                {authMode === 'login' ? 'O CON TU CORREO' : 'O COMPLETA TUS DATOS'}
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
            <View style={styles.formFields}>
              {authMode === 'signup' && (
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Nombre completo</Text>
                  <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Ionicons name="person-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="Tu nombre y apellido"
                      placeholderTextColor={theme.textMuted}
                      value={fullName}
                      onChangeText={setFullName}
                      style={[styles.input, { color: theme.text }]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Correo electrónico</Text>
                <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Ionicons name="mail-outline" size={18} color={theme.textMuted} />
                  <TextInput
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor={theme.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, { color: theme.text }]}
                  />
                </View>
              </View>

              {authMode === 'signup' && (
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>Teléfono (WhatsApp)</Text>
                  <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <Ionicons name="call-outline" size={18} color={theme.textMuted} />
                    <TextInput
                      placeholder="10 dígitos"
                      placeholderTextColor={theme.textMuted}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      style={[styles.input, { color: theme.text }]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: theme.text }]}>Contraseña</Text>
                  {authMode === 'login' && (
                    <TouchableOpacity
                      onPress={() =>
                        WebBrowser.openBrowserAsync('https://inmobiliaria.arwax.pro/forgot-password')
                      }
                    >
                      <Text style={[styles.forgotLink, { color: theme.primary }]}>
                        ¿Olvidaste tu contraseña?
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={theme.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: theme.text }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
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

              {authMode === 'signup' && (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Confirmar contraseña</Text>
                    <View style={[styles.inputBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                      <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />
                      <TextInput
                        placeholder="Repite tu contraseña"
                        placeholderTextColor={theme.textMuted}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        style={[styles.input, { color: theme.text }]}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    activeOpacity={0.8}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
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
                      {acceptedTerms && <Ionicons name="checkmark" size={14} color="#ffffff" />}
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
                </>
              )}

              {/* Action Button */}
              <Button
                title={authMode === 'login' ? 'Iniciar sesión' : 'Crear mi Cuenta'}
                loading={authLoading}
                onPress={handleAuthSubmit}
                style={{ marginTop: 6, height: 50, borderRadius: 16 }}
              />

              {/* Legal Notice */}
              <View style={[styles.legalBox, { borderTopColor: theme.cardBorder }]}>
                <Text style={[styles.legalText, { color: theme.textMuted }]}>
                  Al interactuar, aceptas nuestras{' '}
                  <Text style={[styles.linkHighlight, { color: theme.primary }]} onPress={() => openLegalModal('terms')}>
                    Condiciones del Servicio
                  </Text>{' '}
                  y nuestra{' '}
                  <Text style={[styles.linkHighlight, { color: theme.primary }]} onPress={() => openLegalModal('privacy')}>
                    Política de Privacidad
                  </Text>
                  .
                </Text>
              </View>

              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text style={[styles.trustText, { color: theme.textMuted }]}>
                  Plataforma Inmobiliaria Segura Lomar © {new Date().getFullYear()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  desktopContainer: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    gap: 16,
  },
  userCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  authContainer: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: 14,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    marginBottom: 6,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  authHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 6,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  authSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  segmentedSwitch: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
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
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#e11d48',
  },
  formFields: {
    gap: 12,
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
    height: 50,
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
  legalBox: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 6,
  },
  legalText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
