import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface LegalModalProps {
  visible: boolean;
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
  onAccept?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  initialTab = 'terms',
  onClose,
  onAccept,
}) => {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, visible]);

  const handleTabChange = (tab: 'terms' | 'privacy') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleOpenWeb = async () => {
    const url =
      activeTab === 'terms'
        ? 'https://inmobiliaria.arwax.pro/terms-of-service'
        : 'https://inmobiliaria.arwax.pro/privacy-policy';
    await WebBrowser.openBrowserAsync(url);
  };

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
          <View style={styles.headerLeft}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={14} color="#f97316" />
              <Text style={styles.badgeText}>Marco Legal Lomar</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.card }]}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'terms' && [styles.activeTabBtn, { backgroundColor: theme.cardBorder }],
            ]}
            onPress={() => handleTabChange('terms')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'terms' ? theme.primary : theme.textSecondary },
              ]}
            >
              Condiciones del Servicio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'privacy' && [styles.activeTabBtn, { backgroundColor: theme.cardBorder }],
            ]}
            onPress={() => handleTabChange('privacy')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'privacy' ? theme.primary : theme.textSecondary },
              ]}
            >
              Política de Privacidad
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'terms' ? (
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.text }]}>
                Condiciones del Servicio
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Última actualización: 15 de Octubre de 2026 • Plataforma Lomar
              </Text>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  1. Aceptación de los Términos
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Al registrarse, acceder o utilizar la aplicación móvil y servicios de Lomar Inmobiliaria, usted confirma que ha leído, comprendido y aceptado en su totalidad las presentes Condiciones del Servicio, así como nuestra Política de Privacidad.
                </Text>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  2. Servicios y Recorridos VR 360°
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Lomar proporciona acceso a catálogos inmobiliarios verificados, recorridos virtuales interactivos 360°, estimaciones hipotecarias personalizables y herramientas de contacto directo con asesores certificados. Los precios y disponibilidad están sujetos a validación con los propietarios y promotores.
                </Text>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  3. Cuentas de Usuario y Seguridad
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Usted es el único responsable de mantener la confidencialidad de su contraseña y los accesos a través de credenciales de Google u otros proveedores. Se compromete a notificar de inmediato cualquier actividad no autorizada en su cuenta.
                </Text>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  4. Conducta y Uso Prohibido
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Queda estrictamente prohibido utilizar la plataforma para fines fraudulentos, extracción masiva de datos (scraping), suplantación de identidad o publicación de información engañosa sobre bienes inmuebles.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: theme.text }]}>
                Política de Privacidad
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                En cumplimiento con la Ley Federal de Protección de Datos Personales (LFPDPPP)
              </Text>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  1. Datos Personales Recabados
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Para brindarle una experiencia inmobiliaria óptima, recabamos su nombre completo, correo electrónico, número de teléfono (para coordinación vía WhatsApp), rango de presupuesto e historial de propiedades favoritas o visitas agendadas.
                </Text>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  2. Finalidad del Tratamiento de Datos
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Sus datos se utilizan exclusivamente para: (a) Gestionar su cuenta y perfil; (b) Facilitar citas y atención con agentes autorizados; (c) Notificarle de propiedades que coincidan con sus alertas de radar; (d) Asegurar la autenticación mediante tokens encriptados.
                </Text>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  3. Autenticación con Google
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Cuando inicia sesión utilizando Google OAuth, únicamente recibimos su identificador único verificado, nombre y fotografía de perfil para facilitar un acceso seguro y simplificado sin compartir contraseñas.
                </Text>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  4. Derechos ARCO
                </Text>
                <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                  Usted puede ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición escribiendo a privacidad@arwax.pro o directamente desde la configuración de su perfil en la aplicación.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.webLinkBtn} onPress={handleOpenWeb}>
            <Ionicons name="open-outline" size={16} color="#f97316" />
            <Text style={styles.webLinkText}>Ver versión completa en navegador web</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: theme.cardBorder, backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: theme.primary }]}
            onPress={handleAccept}
          >
            <Text style={styles.acceptBtnText}>Entendido y Aceptar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#fff7ed',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ea580c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 14,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 30,
  },
  textContainer: {
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
  },
  webLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
  },
  webLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f97316',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  acceptBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
});
