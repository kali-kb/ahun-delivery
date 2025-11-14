import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useFavoritesStore } from "../../../store/favoritesStore";
import { authClient } from "../../../lib/authClient";
import { useCallback, useState, useEffect } from "react";
import NetworkError from "../../../components/NetworkError";

export default function Favorites() {
  const router = useRouter();
  const favoriteItems = useFavoritesStore((state) => state.items);
  const { toggleFavorite, fetchUserFavorites } = useFavoritesStore();
  const [sessionData, setSessionData] = useState<{ user: { id: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadFavorites = async () => {
    try {
      setHasError(false);
      setIsLoading(true);
      
      const session = await authClient.getSession();
      if (session.data) {
        setSessionData(session.data);
        await fetchUserFavorites(session.data.user.id);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  // Refresh favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (sessionData?.user?.id) {
        fetchUserFavorites(sessionData.user.id);
      }
    }, [sessionData?.user?.id])
  );

  const handleRetry = () => {
    loadFavorites();
  };

  const handleToggleFavorite = (favorite: any) => {
    // Pass the menuItem to toggleFavorite
    if (favorite.menuItem) {
      toggleFavorite(favorite.menuItem, favorite.userId);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
        </View>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
        <NetworkError 
          onRetry={handleRetry}
          message="Unable to load your favorites. Please check your connection."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {favoriteItems.length > 0 ? (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {favoriteItems.map((favorite: any) => {
            const menuItem = favorite.menuItem;
            if (!menuItem) return null;
            
            return (
              <TouchableOpacity
                key={favorite.id}
                style={styles.itemContainer}
                onPress={() => router.push({
                  pathname: '/home/menu_items/[id]',
                  params: { id: menuItem.id.toString(), item: JSON.stringify(menuItem) }
                })}
              >
                <View>
                  <Image source={{ uri: menuItem.item_img || 'https://via.placeholder.com/400x150.png?text=No+Image' }} style={styles.itemImage} />
                  <TouchableOpacity onPress={() => handleToggleFavorite(favorite)} style={styles.favoriteButton}>
                    <Ionicons
                      name={'heart'}
                      size={22}
                      color={'red'}
                    />
                  </TouchableOpacity>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{menuItem.name}</Text>
                    <Text style={styles.itemPrice}>{menuItem.price} ETB</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#cccccc" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>Tap the heart on any item to save it to your favorites.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: { height: 60, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e2e2' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter-Bold' },
  listContainer: { paddingHorizontal: 15, paddingVertical: 10 },
  itemContainer: { backgroundColor: 'white', borderRadius: 10, marginBottom: 20, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  itemImage: { width: '100%', height: 150 },
  favoriteButton: { position: 'absolute', top: 10, right: 10, zIndex: 1, backgroundColor: 'white', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  itemDetails: { padding: 15 },
  itemName: { fontSize: 18, fontFamily: 'Inter-Bold' },
  itemRestaurant: { fontSize: 14, color: 'gray', marginVertical: 4, fontFamily: 'Inter-Regular' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 5, fontSize: 14, color: 'gray', fontFamily: 'Inter-Regular' },
  itemPrice: { fontFamily: 'Inter-Bold', fontSize: 16, marginTop: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
