import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { PropertyCard, PropertyItem } from '@/components/ui/PropertyCard';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { label: 'Todos', value: 'todos' },
  { label: 'Casas', value: 'casa' },
  { label: 'Deptos', value: 'departamento' },
  { label: 'Terrenos', value: 'terreno' },
  { label: 'Locales', value: 'local' },
  { label: 'Oficinas', value: 'oficina' },
];

export default function ExploreScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const router = useRouter();
  const { user, isVendor } = useAuth();

  // Estados de Navegacion y Modo (Explorar Mercado vs Mis Propiedades)
  const [activeTabMode, setActiveTabMode] = useState<'market' | 'my_properties'>('market');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Estados de Filtros
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('todos');
  const [onlyHotDeals, setOnlyHotDeals] = useState(false);
  const [onlyNearby, setOnlyNearby] = useState(false);

  // Modal de Filtros Avanzados
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterBedrooms, setFilterBedrooms] = useState<number | null>(null);
  const [filterBathrooms, setFilterBathrooms] = useState<number | null>(null);
  const [filterOnlyVr, setFilterOnlyVr] = useState(false);

  // Estados de Datos
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Carga inicial y refresco de propiedades
  const fetchProperties = useCallback(async () => {
    try {
      const params: any = { limit: 50 };
      if (search.trim()) {
        params.search = search.trim();
      }
      if (selectedType !== 'todos') {
        params.type = selectedType;
      }

      const res = await apiClient.get('/products/', { params });
      let data = Array.isArray(res.data) ? res.data : [];

      // Filtro local si es "Mis Propiedades"
      if (activeTabMode === 'my_properties' && user?.id) {
        data = data.filter((item: PropertyItem) => item.user_id === user.id);
      }

      // Filtro de Hot Deals
      if (onlyHotDeals) {
        data = data.filter((item: PropertyItem) => (item.discount && item.discount > 0) || item.tag === 'OPORTUNIDAD');
      }

      // Filtros avanzados
      if (filterMinPrice) {
        const min = parseFloat(filterMinPrice);
        if (!isNaN(min)) data = data.filter((item: PropertyItem) => (item.price || 0) >= min);
      }
      if (filterMaxPrice) {
        const max = parseFloat(filterMaxPrice);
        if (!isNaN(max)) data = data.filter((item: PropertyItem) => (item.price || 0) <= max);
      }
      if (filterBedrooms !== null) {
        data = data.filter((item: PropertyItem) => Number(item.bedrooms || 0) >= filterBedrooms);
      }
      if (filterBathrooms !== null) {
        data = data.filter((item: PropertyItem) => Number(item.bathrooms || 0) >= filterBathrooms);
      }
      if (filterOnlyVr) {
        data = data.filter((item: PropertyItem) => Boolean(item.vr_url));
      }

      setProperties(data);
    } catch (e) {
      console.warn('[ExploreScreen] Error al obtener propiedades:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    search,
    selectedType,
    activeTabMode,
    onlyHotDeals,
    filterMinPrice,
    filterMaxPrice,
    filterBedrooms,
    filterBathrooms,
    filterOnlyVr,
    user?.id,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  // Toggle Favoritos
  const handleToggleFavorite = (propertyId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  // Redirigir a Calculadora con precio pre-cargado
  const handleCalculatorPress = (price: number) => {
    router.push({
      pathname: '/(tabs)/calculator',
      params: { price: String(price) },
    } as any);
  };

  // Accion de Eliminar Propiedad
  const handleDeleteProperty = (property: PropertyItem) => {
    Alert.alert(
      'Eliminar Propiedad',
      `¿Deseas eliminar "${property.title || property.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/products/${property.id}`);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchProperties();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.detail || 'No se pudo eliminar el inmueble');
            }
          },
        },
      ]
    );
  };

  // Texto resumen de busqueda para el hero
  const searchSubtitle = useMemo(() => {
    const parts = [];
    if (selectedType !== 'todos') {
      parts.push(selectedType.toUpperCase());
    } else {
      parts.push('Cualquier tipo');
    }
    if (filterMinPrice || filterMaxPrice) {
      parts.push('Filtro de Precio');
    }
    if (onlyHotDeals) {
      parts.push('Hot Deals 🔥');
    }
    return parts.join(' • ');
  }, [selectedType, filterMinPrice, filterMaxPrice, onlyHotDeals]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 1. HEADER SUPERIOR CON LOGO, TITULO Y ACCIONES */}
      <View style={styles.topHeader}>
        {/* Menu Hamburguesa */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/profile' as any);
          }}
          style={[styles.headerIconButton, { backgroundColor: scheme === 'dark' ? '#18181b' : '#ffffff', borderColor: theme.cardBorder }]}
        >
          <Ionicons name="menu-outline" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Marca: Logo Cuadrado Melocoton + Plataforma Inmobiliaria */}
        <View style={styles.brandContainer}>
          <View style={styles.brandIconBox}>
            <Ionicons name="business-outline" size={17} color="#f97316" />
          </View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>Plataforma Inmobiliaria</Text>
        </View>

        {/* Acciones Derecha: Boton Negro +, Toggle Luna, Avatar */}
        <View style={styles.headerRightActions}>
          {/* Boton Agregar Propiedad (+) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/property/create' as any);
            }}
            style={styles.addPropertyBtn}
          >
            <Ionicons name="add" size={18} color="#ffffff" />
          </TouchableOpacity>

          {/* Luna / Tema */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.headerIconButton, { backgroundColor: scheme === 'dark' ? '#18181b' : '#ffffff', borderColor: theme.cardBorder }]}
          >
            <Ionicons name={scheme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={17} color="#6366f1" />
          </TouchableOpacity>

          {/* Avatar de Usuario con Punto En Linea */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={styles.avatarButton}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SELECTOR DE MODO (EXPLORAR MERCADO vs MIS PROPIEDADES) */}
      <View style={styles.modeSwitcherContainer}>
        <View style={[styles.modeSwitcherPill, { backgroundColor: scheme === 'dark' ? '#18181b' : '#f1f5f9' }]}>
          {/* Opcion: Explorar Mercado */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTabMode('market');
            }}
            style={[
              styles.modeTab,
              activeTabMode === 'market' && [
                styles.modeTabActive,
                { backgroundColor: scheme === 'dark' ? '#27272a' : '#ffffff' },
              ],
            ]}
          >
            <Ionicons
              name="compass-outline"
              size={15}
              color={activeTabMode === 'market' ? theme.text : theme.textMuted}
            />
            <Text
              style={[
                styles.modeTabText,
                { color: activeTabMode === 'market' ? theme.text : theme.textMuted },
                activeTabMode === 'market' && styles.modeTabTextActive,
              ]}
            >
              Explorar Mercado
            </Text>
          </TouchableOpacity>

          {/* Opcion: Mis Propiedades */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (!user) {
                router.push('/(tabs)/profile' as any);
              } else {
                setActiveTabMode('my_properties');
              }
            }}
            style={[
              styles.modeTab,
              activeTabMode === 'my_properties' && [
                styles.modeTabActive,
                { backgroundColor: scheme === 'dark' ? '#27272a' : '#ffffff' },
              ],
            ]}
          >
            <Ionicons
              name="home-outline"
              size={14}
              color={activeTabMode === 'my_properties' ? theme.text : theme.textMuted}
            />
            <Text
              style={[
                styles.modeTabText,
                { color: activeTabMode === 'my_properties' ? theme.text : theme.textMuted },
                activeTabMode === 'my_properties' && styles.modeTabTextActive,
              ]}
            >
              Mis Propiedades
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. HERO SEARCH Y ACCIONES RAPIDAS (FUEGO Y RADAR) */}
      <View style={styles.searchRowContainer}>
        {/* Tarjeta de Busqueda Principal */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsFilterModalOpen(true)}
          style={[
            styles.heroSearchBox,
            {
              backgroundColor: scheme === 'dark' ? '#18181b' : '#ffffff',
              borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          {/* Icono de Lupa Circular Naranja */}
          <View style={styles.searchOrangeCircle}>
            <Ionicons name="search" size={17} color="#ffffff" />
          </View>

          {/* Texto Descriptivo */}
          <View style={styles.searchTexts}>
            <Text
              style={[styles.searchMainTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {search.trim() ? search : '¿Qué propiedad estás buscand...'}
            </Text>
            <Text style={styles.searchSubTitle} numberOfLines={1}>
              {searchSubtitle}
            </Text>
          </View>

          {/* Icono Filtros en el extremo derecho */}
          <View style={styles.filterIconCircle}>
            <Ionicons name="options-outline" size={16} color="#64748b" />
          </View>
        </TouchableOpacity>

        {/* Boton Oportunidades / Hot Deals (Fuego Naranja) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setOnlyHotDeals(!onlyHotDeals);
          }}
          style={[
            styles.quickCircleBtn,
            {
              backgroundColor: onlyHotDeals ? '#ffedd5' : scheme === 'dark' ? '#18181b' : '#fff7ed',
              borderColor: onlyHotDeals ? '#f97316' : '#fed7aa',
            },
          ]}
        >
          <Ionicons name="flame" size={18} color="#f97316" />
        </TouchableOpacity>

        {/* Boton Radar Cercanas (Diana Naranja) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/radar' as any);
          }}
          style={[
            styles.quickCircleBtn,
            {
              backgroundColor: scheme === 'dark' ? '#18181b' : '#fff7ed',
              borderColor: '#fed7aa',
            },
          ]}
        >
          <Ionicons name="navigate-outline" size={17} color="#ea580c" />
        </TouchableOpacity>
      </View>

      {/* 4. CHIPS DE CATEGORIAS (TODOS, CASAS, DEPTOS, TERRENOS, LOCALES) */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedType === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedType(cat.value);
                }}
                style={[
                  styles.categoryChip,
                  active
                    ? [styles.categoryChipActive, { backgroundColor: scheme === 'dark' ? '#f8fafc' : '#0f172a' }]
                    : [
                        styles.categoryChipInactive,
                        {
                          backgroundColor: scheme === 'dark' ? '#18181b' : '#ffffff',
                          borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active
                      ? { color: scheme === 'dark' ? '#0f172a' : '#ffffff', fontWeight: '800' }
                      : { color: scheme === 'dark' ? '#cbd5e1' : '#334155', fontWeight: '700' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. CONTADOR DE INMUEBLES Y ESTADO EN VIVO */}
      <View style={styles.resultsInfoRow}>
        <Text style={[styles.resultsCountText, { color: scheme === 'dark' ? '#94a3b8' : '#64748b' }]}>
          Mostrando <Text style={[styles.resultsCountNumber, { color: theme.text }]}>{properties.length}</Text> inmuebles disponibles
        </Text>

        <View style={styles.liveIndicator}>
          <View style={styles.livePulseDot} />
          <Text style={styles.liveText}>Actualizado en vivo</Text>
        </View>
      </View>

      {/* 6. LISTA PRINCIPAL DE TARJETAS DE PROPIEDADES */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Buscando inmuebles exclusivos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f97316"
              colors={['#f97316']}
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorited={favorites.has(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
              onPress={() => router.push({ pathname: '/property/[id]', params: { id: String(item.id) } } as any)}
              onCalculatorPress={handleCalculatorPress}
              onChatPress={() => router.push({ pathname: '/property/[id]', params: { id: String(item.id) } } as any)}
              onEdit={() => router.push({ pathname: '/property/create', params: { editId: String(item.id) } } as any)}
              onDelete={isVendor ? () => handleDeleteProperty(item) : undefined}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="home-outline" size={36} color="#94a3b8" />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No se encontraron propiedades
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Intenta cambiar de categoría o remover filtros
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedType('todos');
                  setSearch('');
                  setOnlyHotDeals(false);
                  setFilterMinPrice('');
                  setFilterMaxPrice('');
                  fetchProperties();
                }}
                style={styles.resetFiltersBtn}
              >
                <Text style={styles.resetFiltersBtnText}>Restablecer búsqueda</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* 7. DOCK FLOTANTE INFERIOR: SWITCHER LISTA (5) / MAPA */}
      <View style={styles.floatingDockContainer} pointerEvents="box-none">
        {/* Boton Flotante Asistente / Contacto (Izquierda) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/profile' as any);
          }}
          style={styles.floatingChatAvatar}
        >
          <View style={styles.chatAvatarInner}>
            <Ionicons name="chatbubbles" size={16} color="#ffffff" />
          </View>
          <View style={styles.chatOnlineBadge} />
        </TouchableOpacity>

        {/* Pill Central: Lista (X) / Mapa */}
        <View style={styles.dockPill}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode('list');
            }}
            style={[
              styles.dockSegment,
              viewMode === 'list' ? styles.dockSegmentActive : styles.dockSegmentInactive,
            ]}
          >
            <Ionicons name="list" size={15} color="#ffffff" />
            <Text style={styles.dockSegmentTextActive}>
              Lista ({properties.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/radar' as any);
            }}
            style={styles.dockSegmentInactive}
          >
            <Ionicons name="map-outline" size={15} color="#cbd5e1" />
            <Text style={styles.dockSegmentTextInactive}>Mapa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 8. MODAL DE FILTROS AVANZADOS (BOTTOMSHEET PRO) */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: scheme === 'dark' ? '#18181b' : '#ffffff' }]}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filtros Avanzados</Text>
              <TouchableOpacity
                onPress={() => setIsFilterModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Busqueda por palabra clave */}
              <Text style={[styles.filterSectionLabel, { color: theme.text }]}>Búsqueda rápida</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: scheme === 'dark' ? '#27272a' : '#f8fafc', color: theme.text, borderColor: theme.cardBorder }]}
                placeholder="Ciudad, colonia o palabras clave..."
                placeholderTextColor="#94a3b8"
                value={search}
                onChangeText={setSearch}
              />

              {/* Rango de Precios */}
              <Text style={[styles.filterSectionLabel, { color: theme.text }]}>Rango de Precio (MXN)</Text>
              <View style={styles.priceInputsRow}>
                <TextInput
                  style={[styles.modalInputHalf, { backgroundColor: scheme === 'dark' ? '#27272a' : '#f8fafc', color: theme.text, borderColor: theme.cardBorder }]}
                  placeholder="Mínimo ($)"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={filterMinPrice}
                  onChangeText={setFilterMinPrice}
                />
                <TextInput
                  style={[styles.modalInputHalf, { backgroundColor: scheme === 'dark' ? '#27272a' : '#f8fafc', color: theme.text, borderColor: theme.cardBorder }]}
                  placeholder="Máximo ($)"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={filterMaxPrice}
                  onChangeText={setFilterMaxPrice}
                />
              </View>

              {/* Recamaras */}
              <Text style={[styles.filterSectionLabel, { color: theme.text }]}>Recámaras mínimas</Text>
              <View style={styles.chipsRow}>
                {[1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setFilterBedrooms(filterBedrooms === num ? null : num)}
                    style={[
                      styles.filterSelectChip,
                      filterBedrooms === num
                        ? { backgroundColor: '#f97316', borderColor: '#f97316' }
                        : { backgroundColor: scheme === 'dark' ? '#27272a' : '#f1f5f9', borderColor: theme.cardBorder },
                    ]}
                  >
                    <Text style={{ color: filterBedrooms === num ? '#ffffff' : theme.text, fontWeight: '700' }}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Banos */}
              <Text style={[styles.filterSectionLabel, { color: theme.text }]}>Baños mínimos</Text>
              <View style={styles.chipsRow}>
                {[1, 2, 3].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setFilterBathrooms(filterBathrooms === num ? null : num)}
                    style={[
                      styles.filterSelectChip,
                      filterBathrooms === num
                        ? { backgroundColor: '#f97316', borderColor: '#f97316' }
                        : { backgroundColor: scheme === 'dark' ? '#27272a' : '#f1f5f9', borderColor: theme.cardBorder },
                    ]}
                  >
                    <Text style={{ color: filterBathrooms === num ? '#ffffff' : theme.text, fontWeight: '700' }}>
                      {num}+
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tour VR 3D Switch */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilterOnlyVr(!filterOnlyVr)}
                style={styles.toggleRow}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="glasses-outline" size={18} color="#7c3aed" />
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>Solo con Recorrido Virtual 3D</Text>
                </View>
                <Ionicons
                  name={filterOnlyVr ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={filterOnlyVr ? '#7c3aed' : '#94a3b8'}
                />
              </TouchableOpacity>
            </ScrollView>

            {/* Botones de Accion del Modal */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => {
                  setFilterMinPrice('');
                  setFilterMaxPrice('');
                  setFilterBedrooms(null);
                  setFilterBathrooms(null);
                  setFilterOnlyVr(false);
                  setSearch('');
                  setIsFilterModalOpen(false);
                }}
                style={styles.modalResetBtn}
              >
                <Text style={styles.modalResetText}>Limpiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsFilterModalOpen(false);
                  fetchProperties();
                }}
                style={styles.modalApplyBtn}
              >
                <Text style={styles.modalApplyText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 1. Top Header
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addPropertyBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    position: 'relative',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },

  // 2. Segmented Mode Switcher
  modeSwitcherContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  modeSwitcherPill: {
    flexDirection: 'row',
    borderRadius: 22,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 19,
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeTabTextActive: {
    fontWeight: '800',
  },

  // 3. Hero Search & Quick Circles
  searchRowContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroSearchBox: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchOrangeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchTexts: {
    flex: 1,
    gap: 1,
  },
  searchMainTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  searchSubTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  filterIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  quickCircleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 4. Categories
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  categoryChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipInactive: {
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    letterSpacing: -0.2,
  },

  // 5. Results Counter & Live Indicator
  resultsInfoRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsCountNumber: {
    fontWeight: '900',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },

  // 6. List & Empty States
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90, // Espacio para el Dock flotante
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  resetFiltersBtn: {
    marginTop: 12,
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  resetFiltersBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // 7. Floating Bottom Dock
  floatingDockContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingChatAvatar: {
    position: 'absolute',
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  chatAvatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  chatOnlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  dockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 26,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  dockSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  dockSegmentActive: {
    backgroundColor: '#f97316',
  },
  dockSegmentInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
  },
  dockSegmentTextActive: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  dockSegmentTextInactive: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },

  // 8. Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  modalCloseBtn: {
    padding: 4,
  },
  filterSectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
  },
  modalInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  priceInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalInputHalf: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  filterSelectChip: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  modalResetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResetText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '800',
  },
  modalApplyBtn: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
