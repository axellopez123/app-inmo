import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
      setLoading(true);
      apiClient.get('/products/favorites')
        .then(({ data }) => {
          const list = data?.map((f: any) => f.product || f) || [];
          setFavorites(list);
        })
        .catch((e) => console.warn('[Favorites] Error:', e))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Mis Favoritos</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Inmuebles guardados para comparar o agendar visita
        </Text>
      </View>

      {!user ? (
        /* Estado para Invitados */
        <View style={styles.guestState}>
          <View style={styles.heartCircle}>
            <Ionicons name="heart" size={36} color="#e11d48" />
          </View>
          <Text style={[styles.guestTitle, { color: theme.text }]}>
            Guarda tus favoritos
          </Text>
          <Text style={[styles.guestSub, { color: theme.textSecondary }]}>
            Inicia sesión para sincronizar las propiedades que más te gusten en todos tus dispositivos.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(auth)/login' as any);
            }}
            style={styles.guestBtn}
          >
            <Text style={styles.guestBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorited={true}
              onPress={() => router.push({ pathname: '/property/[id]', params: { id: String(item.id) } } as any)}
              onCalculatorPress={(price) =>
                router.push({ pathname: '/(tabs)/calculator', params: { price: String(price) } } as any)
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={44} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No tienes favoritos guardados</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Explora el catálogo y toca el corazón en las propiedades que te interesen.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)' as any)}
                style={styles.exploreBtn}
              >
                <Text style={styles.exploreBtnText}>Explorar Inmuebles</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingVertical: 14, gap: 2 },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500' },
  list: { paddingBottom: 24, paddingTop: 8 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },
  exploreBtn: {
    marginTop: 12,
    backgroundColor: '#f97316',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 16,
  },
  exploreBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  guestState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
    marginTop: -40,
  },
  heartCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  guestTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  guestSub: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  guestBtn: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  guestBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});
