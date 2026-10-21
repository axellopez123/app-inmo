import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { PropertyCard, PropertyItem } from '@/components/ui/PropertyCard';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/api/client';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { user } = useAuth();
  const router = useRouter();

  const [favorites, setFavorites] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      apiClient.get('/products/favorites')
        .then(({ data }) => {
          const list = data?.map((f: any) => f.product || f) || [];
          setFavorites(list);
        })
        .catch((e) => console.warn('[Favorites] Error:', e));
    }
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mis Favoritos</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Propiedades que te interesan para comparar o visitar
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            isFavorited={true}
            onPress={() => router.push({ pathname: '/property/[id]', params: { id: String(item.id) } } as any)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No tienes favoritos guardados</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Toca el corazón en cualquier propiedad del catálogo para guardarla aquí.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingVertical: 14 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  list: { paddingBottom: 20 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center' },
});
