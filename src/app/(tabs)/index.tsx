import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { PropertyCard, PropertyItem } from '@/components/ui/PropertyCard';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  { label: 'Todos', value: 'todos' },
  { label: 'Casas', value: 'casa' },
  { label: 'Deptos', value: 'departamento' },
  { label: 'Terrenos', value: 'terreno' },
  { label: 'Locales', value: 'local' },
];

export default function ExploreScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const router = useRouter();
  const { user, isVendor } = useAuth();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('todos');

  const fetchProperties = useCallback(async () => {
    try {
      const params: any = { limit: 20 };
      if (search.trim()) params.search = search.trim();
      if (selectedType !== 'todos') params.type = selectedType;

      const { data } = await apiClient.get('/products/', { params });
      setProperties(data || []);
    } catch (err) {
      console.warn('[Explore] Error cargando inmuebles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedType]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Top Header con Branding */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>LOMAR</Text>
          <Text style={[styles.brandSubtitle, { color: theme.primary }]}>BIENES RAÍCES</Text>
        </View>

        {isVendor ? (
          <View style={styles.vendorBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#a855f7" />
            <Text style={styles.vendorBadgeText}>MODO ASESOR</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.userButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person" size={16} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Buscador Rápido */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            placeholder="Buscar ciudad, calle, título..."
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchProperties}
            style={[styles.searchInput, { color: theme.text }]}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chips de Categorías (Casa, Depto, Terreno, Local) */}
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
                activeOpacity={0.8}
                onPress={() => setSelectedType(cat.value)}
                style={[
                  styles.categoryChip,
                  active
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: active ? '#ffffff' : theme.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de Propiedades */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando catálogo inmobiliario...
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
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => router.push({ pathname: '/property/[id]', params: { id: String(item.id) } } as any)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No se encontraron inmuebles
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Intenta con otros filtros o términos de búsqueda
              </Text>
            </View>
          }
        />
      )}
          {isVendor && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/property/create' as any)}
          style={[styles.floatingAddBtn, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.floatingAddBtnText}>Publicar</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: -2,
  },
  vendorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  vendorBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a855f7',
  },
  userButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingAddBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
