import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Badge } from './Badge';
import { useAuth } from '@/context/AuthContext';
import { MEDIA_BASE_URL } from '@/constants/Config';

export interface PropertyItem {
  id: number;
  title?: string;
  name?: string;
  price: number;
  discount?: number;
  priceWithDiscount?: number;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkings?: number;
  build?: number;
  type?: string;
  status?: string;
  images?: Array<{ image_url?: string; url?: string; original?: string }>;
  phone?: string;
  whatsapp?: string;
}

interface PropertyCardProps {
  property: PropertyItem;
  onPress: () => void;
  onToggleFavorite?: () => void;
  isFavorited?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onToggleFavorite,
  isFavorited = false,
}) => {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { isVendor } = useAuth();

  const title = property.title || property.name || 'Propiedad Lomar';
  const location = [property.city, property.state].filter(Boolean).join(', ') || 'México';

  // Imagen principal
  let imageUri = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';
  if (property.images && property.images.length > 0) {
    const rawUrl = property.images[0].image_url || property.images[0].url || property.images[0].original;
    if (rawUrl) {
      imageUri = rawUrl.startsWith('http') ? rawUrl : `${MEDIA_BASE_URL}/${rawUrl.replace(/^\//, '')}`;
    }
  }

  const formatPrice = (val?: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getBadgeVariant = (t?: string): 'casa' | 'departamento' | 'terreno' | 'local' | 'default' => {
    const lower = (t || '').toLowerCase();
    if (lower === 'casa') return 'casa';
    if (lower.includes('depto') || lower.includes('departamento')) return 'departamento';
    if (lower === 'terreno') return 'terreno';
    if (lower === 'local' || lower.includes('local')) return 'local';
    return 'default';
  };

  const badgeText = property.type === 'local' ? 'Local Comercial' : property.type || 'Inmueble';

  const handleWhatsApp = (e: any) => {
    e.stopPropagation();
    const phone = (property.whatsapp || property.phone || '521234567890').replace(/\D/g, '');
    const text = encodeURIComponent(
      `¡Hola! Vi esta propiedad en la App de Lomar y me interesa más información:\n\n🏡 *${title}*\n💰 Precio: ${formatPrice(property.price)}\n📍 ${location}`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      {/* Portada con Badges superiores */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

        <View style={styles.topBadgesRow}>
          <Badge label={badgeText} variant={getBadgeVariant(property.type)} />

          {/* Margen confidencial SOLO para vendedores */}
          {isVendor && property.discount ? property.discount > 0 ? (
            <Badge
              label={`🔒 -${Math.round(property.discount)}% VEND.`}
              variant="vendor"
            />
          ) : null : null}
        </View>

        {/* Botón Favorito */}
        {onToggleFavorite && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorited ? '#ef4444' : '#ffffff'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Contenido / Datos de la Propiedad */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={theme.primary} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {/* Specs Chips */}
        <View style={styles.specsRow}>
          {Number(property.bedrooms) > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={13} color={theme.textMuted} />
              <Text style={[styles.specText, { color: theme.textSecondary }]}>
                {property.bedrooms} recs
              </Text>
            </View>
          )}

          {Number(property.bathrooms) > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={13} color={theme.textMuted} />
              <Text style={[styles.specText, { color: theme.textSecondary }]}>
                {property.bathrooms} baños
              </Text>
            </View>
          )}

          {Number(property.build) > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="cube-outline" size={13} color={theme.textMuted} />
              <Text style={[styles.specText, { color: theme.textSecondary }]}>
                {property.build} m²
              </Text>
            </View>
          )}
        </View>

        {/* Footer: Precios y Contacto */}
        <View style={[styles.footerRow, { borderTopColor: theme.cardBorder }]}>
          <View>
            <Text style={[styles.priceText, { color: theme.text }]}>
              {formatPrice(property.price)}
            </Text>

            {/* Piso de negociación confidencial para vendedores */}
            {isVendor && property.discount ? property.discount > 0 && property.priceWithDiscount ? (
              <Text style={styles.vendorFloorText}>
                🔒 Piso: {formatPrice(property.priceWithDiscount)}
              </Text>
            ) : null : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleWhatsApp}
            style={styles.waButton}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#ffffff" />
            <Text style={styles.waButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
    backgroundColor: '#1e293b',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  body: {
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  vendorFloorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a855f7',
    marginTop: 1,
  },
  waButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10b981',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  waButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
