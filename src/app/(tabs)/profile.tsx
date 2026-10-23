import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { user, isVendor, logout } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir de tu cuenta en Lomar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/(tabs)' as any);
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
          /* VISTA CON SESION INICIADA (DASHBOARD DEL USUARIO)         */
          /* ========================================================= */
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>Mi Perfil</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Gestiona tu cuenta, inmuebles y preferencias
              </Text>
            </View>

            {/* Tarjeta de Usuario */}
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
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {user.full_name || 'Usuario Lomar'}
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
                    {isVendor ? '🛡️ ASESOR CERTIFICADO' : '👤 CLIENTE VERIFICADO'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Accesos Rapidos del Usuario */}
            <View style={styles.menuSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                GESTIÓN INMOBILIARIA
              </Text>

              {isVendor && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                  onPress={() => router.push('/property/create' as any)}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: '#ffedd5' }]}>
                    <Ionicons name="add-circle-outline" size={20} color="#ea580c" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuItemTitle, { color: theme.text }]}>Publicar Nuevo Inmueble</Text>
                    <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Sube fotos, precio y detalles</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => router.push('/(tabs)/favorites' as any)}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#ffe4e6' }]}>
                  <Ionicons name="heart-outline" size={20} color="#e11d48" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>Mis Favoritos Guardados</Text>
                  <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Inmuebles que te interesan</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => router.push('/(tabs)/calculator' as any)}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="calculator-outline" size={20} color="#d97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>Calculadora de Crédito</Text>
                  <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Infonavit, BBVA, HSBC</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => router.push('/(tabs)/radar' as any)}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#e0f2fe' }]}>
                  <Ionicons name="compass-outline" size={20} color="#0284c7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuItemTitle, { color: theme.text }]}>Radar Inmobiliario</Text>
                  <Text style={[styles.menuItemSub, { color: theme.textSecondary }]}>Oportunidades cerca de ti</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Soporte y Cerrar Sesion */}
            <View style={styles.menuSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                SOPORTE Y CUENTA
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => WebBrowser.openBrowserAsync('https://inmobiliaria.arwax.pro/terminos-y-condiciones')}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#f1f5f9' }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#475569" />
                </View>
                <Text style={[styles.menuItemTitle, { flex: 1, color: theme.text }]}>Términos y Privacidad</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* VISTA INVITADO / GUEST (PATRÓN PROFESIONAL TIPO AIRBNB)   */
          /* ========================================================= */
          <View style={styles.guestContainer}>
            {/* Emblema Hero */}
            <View style={styles.guestIconCircle}>
              <View style={styles.guestIconInner}>
                <Ionicons name="person" size={36} color="#f97316" />
              </View>
            </View>

            {/* Titulo y Mensaje de Bienvenida */}
            <Text style={[styles.guestTitle, { color: theme.text }]}>
              Tu espacio en Lomar
            </Text>
            <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>
              Inicia sesión o crea una cuenta para guardar inmuebles favoritos, gestionar tus propiedades y recibir asesoría personalizada.
            </Text>

            {/* Boton Primario Destacado: INICIAR SESION / REGISTRARSE */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(auth)/login' as any);
              }}
              style={styles.guestAuthButton}
            >
              <Ionicons name="log-in-outline" size={20} color="#ffffff" />
              <Text style={styles.guestAuthButtonText}>Iniciar Sesión / Registrarse</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>

            {/* Beneficios de tener cuenta */}
            <View style={[styles.benefitsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={[styles.benefitsHeader, { color: theme.text }]}>
                Con tu cuenta puedes:
              </Text>

              <View style={styles.benefitRow}>
                <View style={[styles.benefitIconBox, { backgroundColor: '#ffedd5' }]}>
                  <Ionicons name="business" size={16} color="#ea580c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.benefitTitle, { color: theme.text }]}>Publicar y gestionar inmuebles</Text>
                  <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>Sube casas o terrenos en venta y renta</Text>
                </View>
              </View>

              <View style={styles.benefitRow}>
                <View style={[styles.benefitIconBox, { backgroundColor: '#ffe4e6' }]}>
                  <Ionicons name="heart" size={16} color="#e11d48" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.benefitTitle, { color: theme.text }]}>Sincronizar tus favoritos</Text>
                  <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>Consúltalos en tu celular, tablet o computadora</Text>
                </View>
              </View>

              <View style={styles.benefitRow}>
                <View style={[styles.benefitIconBox, { backgroundColor: '#e0f2fe' }]}>
                  <Ionicons name="compass" size={16} color="#0284c7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.benefitTitle, { color: theme.text }]}>Alertas de radar exclusivas</Text>
                  <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>Enterate antes que nadie de nuevas oportunidades</Text>
                </View>
              </View>
            </View>

            {/* Enlace a terminos */}
            <TouchableOpacity
              onPress={() => WebBrowser.openBrowserAsync('https://inmobiliaria.arwax.pro/terminos-y-condiciones')}
              style={{ marginTop: 24 }}
            >
              <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                Al registrarte aceptas nuestros Términos y Aviso de Privacidad
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  desktopContainer: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  menuSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuItemSub: {
    fontSize: 12,
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    gap: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800',
  },

  // Estilos Vista Invitado
  guestContainer: {
    paddingHorizontal: 24,
    paddingTop: 36,
    alignItems: 'center',
  },
  guestIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fed7aa',
  },
  guestIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 28,
  },
  guestAuthButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 28,
  },
  guestAuthButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  benefitsCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  benefitsHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  benefitIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  benefitDesc: {
    fontSize: 12,
    marginTop: 1,
  },
});
