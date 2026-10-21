import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  Linking,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api/client';
import { MEDIA_BASE_URL } from '@/constants/Config';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { isVendor } = useAuth();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiClient.get(`/products/${id}`)
        .then(({ data }) => setProperty(data))
        .catch((e) => console.warn('[PropertyDetail] Error:', e))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || !property) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const formatPrice = (val?: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val || 0);

  const title = property.title || property.name || 'Propiedad Lomar';
  const location = [property.address, property.city, property.state].filter(Boolean).join(', ');

  let imageUri = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';
  if (property.images && property.images.length > 0) {
    const raw = property.images[0].image_url || property.images[0].url;
    if (raw) imageUri = raw.startsWith('http') ? raw : `${MEDIA_BASE_URL}/${raw.replace(/^\//, '')}`;
  }

  const handleWhatsApp = () => {
    const phone = (property.whatsapp || property.phone || '521234567890').replace(/\D/g, '');
    const text = encodeURIComponent(
      `¡Hola! Me interesa la propiedad en Lomar:\n\n🏡 *${title}*\n💰 Precio: ${formatPrice(property.price)}\n📍 ${location}`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Imagen de Portada */}
        <View style={styles.imageBox}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          <View style={styles.badgeRow}>
            <Badge label={property.type === 'local' ? 'Local Comercial' : property.type || 'Inmueble'} variant="casa" />
          </View>
        </View>

        <View style={styles.body}>
          {/* Banner de margen de vendedor CONFIDENCIAL */}
          {isVendor && property.discount ? property.discount > 0 ? (
            <View style={styles.vendorAlert}>
              <Ionicons name="lock-closed" size={16} color="#a855f7" />
              <View style={{ flex: 1 }}>
                <Text style={styles.vendorAlertTitle}>
                  Margen Confidencial de Vendedor ({Math.round(property.discount)}% Desc.)
                </Text>
                <Text style={styles.vendorAlertSub}>
                  Piso de negociación interno: {formatPrice(property.priceWithDiscount)} (Los clientes solo ven el precio público).
                </Text>
              </View>
            </View>
          ) : null : null}

          {/* Precio y Título */}
          <Text style={[styles.price, { color: theme.text }]}>{formatPrice(property.price)}</Text>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.location, { color: theme.textSecondary }]}>
            <Ionicons name="location-sharp" size={14} color={theme.primary} /> {location}
          </Text>

          {/* Specs Grid */}
          <View style={[styles.specsCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={styles.specCell}>
              <Ionicons name="bed-outline" size={18} color={theme.primary} />
              <Text style={[styles.specValue, { color: theme.text }]}>{property.bedrooms || 0}</Text>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Recámaras</Text>
            </View>
            <View style={styles.specCell}>
              <Ionicons name="water-outline" size={18} color={theme.primary} />
              <Text style={[styles.specValue, { color: theme.text }]}>{property.bathrooms || 0}</Text>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Baños</Text>
            </View>
            <View style={styles.specCell}>
              <Ionicons name="car-outline" size={18} color={theme.primary} />
              <Text style={[styles.specValue, { color: theme.text }]}>{property.parkings || 0}</Text>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Cajones</Text>
            </View>
            <View style={styles.specCell}>
              <Ionicons name="cube-outline" size={18} color={theme.primary} />
              <Text style={[styles.specValue, { color: theme.text }]}>{property.build || 0} m²</Text>
              <Text style={[styles.specLabel, { color: theme.textSecondary }]}>Construcción</Text>
            </View>
          </View>

          {/* Descripción */}
          {Boolean(property.description) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripción</Text>
              <Text style={[styles.descText, { color: theme.textSecondary }]}>
                {property.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.cardBorder }]}>
        <Button
          title="Contactar por WhatsApp"
          variant="primary"
          icon={<Ionicons name="logo-whatsapp" size={18} color="#ffffff" />}
          onPress={handleWhatsApp}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 100 },
  imageBox: { height: 260, width: '100%', position: 'relative' },
  image: { width: '100%', height: '100%' },
  badgeRow: { position: 'absolute', top: 16, left: 16 },
  body: { padding: 20, gap: 10 },
  vendorAlert: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 16,
    padding: 12,
  },
  vendorAlertTitle: { fontSize: 12, fontWeight: '800', color: '#a855f7' },
  vendorAlertSub: { fontSize: 11, color: '#c084fc', marginTop: 2 },
  price: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  location: { fontSize: 13, fontWeight: '500' },
  specsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginVertical: 10,
  },
  specCell: { flex: 1, alignItems: 'center', gap: 4 },
  specValue: { fontSize: 15, fontWeight: '800' },
  specLabel: { fontSize: 10, fontWeight: '600' },
  section: { marginTop: 10, gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  descText: { fontSize: 13, lineHeight: 20 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
});
