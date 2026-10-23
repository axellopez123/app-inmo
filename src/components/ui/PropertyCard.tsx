import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Linking,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { MEDIA_BASE_URL } from '@/constants/Config';

export interface PropertyImage {
  id?: number;
  image_url?: string;
  url?: string;
  original?: string;
  is_main?: boolean;
}

export interface PropertyItem {
  id: number;
  user_id?: number;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  priceWithDiscount?: number;
  discount?: number;
  type?: string;
  status?: string;
  state?: string;
  city?: string;
  address?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  build?: number | string;
  whatsapp?: string;
  phone?: string;
  images?: PropertyImage[];
  is_favorite?: boolean;
  vr_url?: string;
  tag?: string; // e.g. REMODELADO, PREVENTA, OPORTUNIDAD
}

interface PropertyCardProps {
  property: PropertyItem;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorited?: boolean;
  onCalculatorPress?: (price: number) => void;
  onChatPress?: (property: PropertyItem) => void;
  onEdit?: (property: PropertyItem) => void;
  onDelete?: (property: PropertyItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onToggleFavorite,
  isFavorited = false,
  onCalculatorPress,
  onChatPress,
  onEdit,
  onDelete,
}) => {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { user, isVendor } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const title = property.title || property.name || 'Inmueble Lomar';
  const location = [property.city, property.state].filter(Boolean).join(', ') || 'Guadalajara, Jalisco';

  // Obtener lista completa de imagenes para el carrusel
  const imagesList: string[] = [];
  if (property.images && property.images.length > 0) {
    property.images.forEach((img) => {
      const rawUrl = img.image_url || img.url || img.original;
      if (rawUrl) {
        imagesList.push(
          rawUrl.startsWith('http') ? rawUrl : `${MEDIA_BASE_URL}/${rawUrl.replace(/^\//, '')}`
        );
      }
    });
  }
  if (imagesList.length === 0) {
    imagesList.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80');
  }

  const formatPrice = (val?: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeImageIndex && slide >= 0 && slide < imagesList.length) {
      setActiveImageIndex(slide);
    }
  };

  const handleWhatsApp = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phone = (property.whatsapp || property.phone || '523312345678').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hola, me interesa mas informacion sobre: ${title} (${formatPrice(property.price)}) ubicada en ${location}.`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${text}`);
  };

  const handleCalculator = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onCalculatorPress) {
      onCalculatorPress(property.price || 0);
    }
  };

  const handleChat = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onChatPress) {
      onChatPress(property);
    }
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onEdit) {
      onEdit(property);
    }
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (onDelete) {
      onDelete(property);
    }
  };

  // Tag superior derecho: REMODELADO, PREVENTA, OPORTUNIDAD, etc.
  const displayTag = property.tag || (property.discount && property.discount > 0 ? 'OPORTUNIDAD' : 'REMODELADO');
  const isOwnerOrVendor = isVendor || (user && property.user_id === user.id);

  return (
    <TouchableOpacity
      activeOpacity={0.94}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: scheme === 'dark' ? '#18181b' : '#ffffff',
          borderColor: scheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
        },
      ]}
    >
      {/* 1. SECCION DE IMAGEN CON BADGES Y DOTS */}
      <View style={styles.imageContainer}>
        {imagesList.length === 1 ? (
          <Image source={{ uri: imagesList[0] }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.carouselScrollView}
          >
            {imagesList.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.carouselImage} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        {/* Badges Superiores Izquierdos: TIPO + VR 3D */}
        <View style={styles.topBadgesRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {(property.type || 'CASA').toUpperCase()}
            </Text>
          </View>

          <View style={styles.vrBadge}>
            <Ionicons name="glasses-outline" size={13} color="#ffffff" style={{ marginRight: 3 }} />
            <Text style={styles.vrBadgeText}>VR 3D</Text>
          </View>
        </View>

        {/* Boton Favorito Superior Derecho */}
        {onToggleFavorite && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleFavorite();
            }}
            style={[
              styles.favoriteButton,
              isFavorited && styles.favoriteButtonActive,
            ]}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorited ? '#ffffff' : '#0f172a'}
            />
          </TouchableOpacity>
        )}

        {/* Badge Inferior Izquierdo: DISPONIBLE */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusBadgeText}>
            {property.status === 'sold'
              ? 'Vendido'
              : property.status === 'reserved'
              ? 'Apartado'
              : 'Disponible'}
          </Text>
        </View>

        {/* Puntos del Carrusel (Centro Inferior) */}
        {imagesList.length > 1 && (
          <View style={styles.dotsContainer}>
            {imagesList.map((_, dotIdx) => (
              <View
                key={dotIdx}
                style={[
                  styles.dot,
                  dotIdx === activeImageIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* 2. CUERPO DE LA TARJETA */}
      <View style={styles.body}>
        {/* Fila: Titulo + Tag Naranja (REMODELADO) */}
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: scheme === 'dark' ? '#f8fafc' : '#0f172a' }]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>{displayTag}</Text>
          </View>
        </View>

        {/* Ubicacion con Pin Naranja */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color="#f97316" />
          <Text
            style={[styles.locationText, { color: scheme === 'dark' ? '#94a3b8' : '#64748b' }]}
            numberOfLines={1}
          >
            {location}
          </Text>
        </View>

        {/* Caracteristicas: Recamaras, Banos, Metros */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="bed-outline" size={14} color={scheme === 'dark' ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.specText, { color: scheme === 'dark' ? '#e2e8f0' : '#334155' }]}>
              {property.bedrooms || 3} recs
            </Text>
          </View>

          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={14} color={scheme === 'dark' ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.specText, { color: scheme === 'dark' ? '#e2e8f0' : '#334155' }]}>
              {property.bathrooms || 2} baños
            </Text>
          </View>

          <View style={styles.specItem}>
            <Ionicons name="cube-outline" size={14} color={scheme === 'dark' ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.specText, { color: scheme === 'dark' ? '#e2e8f0' : '#334155' }]}>
              {property.build || 50} m²
            </Text>
          </View>
        </View>

        {/* 3. FOOTER: PRECIO Y BOTONES DE ACCION CIRCULARES */}
        <View style={[styles.footerRow, { borderTopColor: scheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }]}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceText, { color: scheme === 'dark' ? '#f8fafc' : '#0f172a' }]}>
              {formatPrice(property.price || 800000)}
            </Text>
            <Text style={styles.priceLabel}>PRECIO BASE</Text>
          </View>

          {/* Botones de Accion Circulares (WhatsApp, Chat, Calculadora, Editar, Borrar) */}
          <View style={styles.actionsRow}>
            {/* WhatsApp */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleWhatsApp}
              style={[styles.actionCircle, { backgroundColor: '#dcfce7' }]}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#16a34a" />
            </TouchableOpacity>

            {/* Chat */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleChat}
              style={[styles.actionCircle, { backgroundColor: '#e0f2fe' }]}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={15} color="#0284c7" />
            </TouchableOpacity>

            {/* Calculadora */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCalculator}
              style={[styles.actionCircle, { backgroundColor: '#ffedd5' }]}
            >
              <Ionicons name="calculator-outline" size={16} color="#ea580c" />
            </TouchableOpacity>

            {/* Editar (si es creador o vendor) */}
            {isOwnerOrVendor && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEdit}
                style={[styles.actionCircle, { backgroundColor: '#ede9fe' }]}
              >
                <Ionicons name="create-outline" size={15} color="#7c3aed" />
              </TouchableOpacity>
            )}

            {/* Eliminar (si es creador o vendor) */}
            {isOwnerOrVendor && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                style={[styles.actionCircle, { backgroundColor: '#ffe4e6' }]}
              >
                <Ionicons name="trash-outline" size={15} color="#e11d48" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    height: 230,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  carouselScrollView: {
    width: '100%',
    height: '100%',
  },
  carouselImage: {
    width: SCREEN_WIDTH - 40, // Espacio interior de la lista
    height: 230,
  },
  topBadgesRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  typeBadge: {
    backgroundColor: '#059669', // Verde esmeralda exactamente como en la captura
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  vrBadge: {
    backgroundColor: '#7c3aed', // Morado VR como en la captura
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vrBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonActive: {
    backgroundColor: '#f43f5e', // Rosa/Rojo intenso cuando activo
  },
  statusBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    zIndex: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#f97316', // Pastilla alargada naranja de la captura
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagBadge: {
    borderWidth: 1.5,
    borderColor: '#ea580c',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagBadgeText: {
    color: '#ea580c',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    gap: 1,
  },
  priceText: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
