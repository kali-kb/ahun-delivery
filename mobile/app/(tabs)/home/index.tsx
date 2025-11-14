import { Text, View, RefreshControl } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from 'react-native';
import { ScrollView, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native"; 
import { useRouter, useFocusEffect } from "expo-router"; 
import React, { useEffect, useState, useCallback } from "react";
import { useLocationStore } from "../../../store/locationStore";
import { useFavoritesStore } from "../../../store/favoritesStore";
import { useCartStore } from "../../../store/cartStore";
import { authClient } from "../../../lib/authClient";
import NetworkError from "../../../components/NetworkError";
import { apiGet } from "../../../lib/api";

interface SessionData {
  session: {
    token: string;
    expiresAt: Date;
  };
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
}

interface Category {
  id: number;
  name: string;
  image: string;
}

interface Restaurant {
  id: number;
  ownerId: string;
  image: string | null;
  name: string;
  description: string | null;
  location: string;
  // Add other fields if needed, like openingHours, metadata, etc.
}

interface Promo {
  id: number;
  headline: string;
  subheading: string;
  cta: string | null;
  deadline: string;
  createdAt: string;
}

const SkeletonLoader = () => (
  <ScrollView style={{ flex: 1, backgroundColor: '#f2f2f2' }} showsVerticalScrollIndicator={false}>
    <View style={{ padding: 20 }}>
      {/* Search bar skeleton */}
      <View style={{ height: 48, backgroundColor: '#e0e0e0', borderRadius: 10, marginBottom: 20 }} />
      {/* Promo card skeleton */}
      <View style={{ height: 120, backgroundColor: '#e0e0e0', borderRadius: 15 }} />
    </View>

    <View style={{ paddingLeft: 20, paddingTop: 10 }}>
      {/* Categories title skeleton */}
      <View style={{ height: 22, width: 120, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 10 }} />
      {/* Categories list skeleton */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 15, paddingRight: 20 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={{ alignItems: 'center' }}>
              <View style={{ width: 60, height: 60, backgroundColor: '#e0e0e0', borderRadius: 30 }} />
              <View style={{ height: 14, width: 50, backgroundColor: '#e0e0e0', borderRadius: 4, marginTop: 5 }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>

    <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
      {/* Restaurants title skeleton */}
      <View style={{ height: 22, width: 120, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 10 }} />
      {/* Restaurants list skeleton */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array.from({ length: 2 }).map((_, index) => (
          <View key={index} style={[styles.restaurantCard, { backgroundColor: '#e0e0e0' }]}>
            <View style={[styles.restaurantImage, { backgroundColor: '#d0d0d0' }]} />
            <View style={styles.restaurantDetails}>
              <View style={{ height: 20, width: '80%', backgroundColor: '#d0d0d0', borderRadius: 4, marginBottom: 5 }} />
              <View style={{ height: 16, width: '60%', backgroundColor: '#d0d0d0', borderRadius: 4 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>

    <View style={{ padding: 20 }}>
      {/* Popular title skeleton */}
      <View style={{ height: 22, width: 150, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 10 }} />
      {/* Popular items skeleton */}
      {Array.from({ length: 2 }).map((_, index) => (
        <View key={index} style={{ backgroundColor: '#e0e0e0', borderRadius: 10, marginBottom: 15, height: 250 }} />
      ))}
    </View>
  </ScrollView>
);

const PopularItemsSkeleton = () => (
  <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 10 }}>
      Popular near you
    </Text>
    {Array.from({ length: 2 }).map((_, index) => (
      <View 
        key={index} 
        style={{ 
          backgroundColor: 'white', 
          borderRadius: 10, 
          marginBottom: 15, 
          overflow: 'hidden' 
        }}
      >
        {/* Image skeleton */}
        <View style={{ width: '100%', height: 150, backgroundColor: '#e0e0e0' }} />
        
        {/* Favorite button skeleton */}
        <View 
          style={{ 
            position: 'absolute', 
            top: 15, 
            right: 15, 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            backgroundColor: '#d0d0d0' 
          }} 
        />
        
        {/* Content skeleton */}
        <View style={{ padding: 15 }}>
          {/* Item name */}
          <View style={{ height: 18, width: '70%', backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
          
          {/* Description */}
          <View style={{ height: 14, width: '90%', backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 5 }} />
          <View style={{ height: 14, width: '60%', backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
          
          {/* Rating */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#e0e0e0', marginRight: 5 }} />
            <View style={{ height: 14, width: 100, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
          </View>
          
          {/* Restaurant name */}
          <View style={{ height: 12, width: '50%', backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
          
          {/* Price */}
          <View style={{ height: 16, width: 80, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 5 }} />
          
          {/* Distance */}
          <View style={{ height: 12, width: 70, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
        </View>
      </View>
    ))}
  </View>
);

const LocationNotSetCard = ({ onSetLocation }: { onSetLocation: () => void }) => (
  <View style={{ padding: 20 }}>
    <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 10 }}>
      Popular near you
    </Text>
    <View style={styles.messageCard}>
      <Ionicons name="location-outline" size={48} color="gray" />
      <Text style={styles.messageText}>
        This feature will be available once you have set your location
      </Text>
      <TouchableOpacity 
        style={styles.setLocationButton}
        onPress={onSetLocation}
      >
        <Text style={styles.setLocationButtonText}>Set Location</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function Index() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [hasValidLocation, setHasValidLocation] = useState(false);
  const [hasError, setHasError] = useState(false);
  const location = useLocationStore();
  const setGlobalLocation = useLocationStore((state) => state.setLocation);
  const favoriteItems = useFavoritesStore((state) => state.items);
  const { toggleFavorite } = useFavoritesStore();
  const fetchCartItems = useCartStore((state) => state.fetchCartItems);

  // Helper function to check if location is the default/unset value
  const isDefaultLocation = (lat: number, lon: number, address: string): boolean => {
    return lat === 9.0054 && lon === 38.7636 && address === 'Select a location';
  };

  // Fetch popular items separately based on location
  const loadPopularItems = async (lat: number, lon: number) => {
    // Only fetch if location is valid
    if (isDefaultLocation(lat, lon, location.address)) {
      setHasValidLocation(false);
      setIsLoadingPopular(false);
      return;
    }
    
    setIsLoadingPopular(true);
    setHasValidLocation(true);
    
    try {
      const popularUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/menus/popular/nearby?lat=${lat}&lon=${lon}&limit=10`;
      const response = await apiGet(popularUrl);
      
      if (response.ok) {
        const data = await response.json();
        setPopularItems(data);
      }
    } catch (error) {
      console.error('Failed to load popular items:', error);
    } finally {
      setIsLoadingPopular(false);
    }
  };

  const isFavorited = (itemId: number) => favoriteItems.some(fav => fav.menuItemId === itemId);

  const handleToggleFavorite = (item: any, userId: string) => toggleFavorite(item, userId);

  const loadUserLocation = async (userId: string) => {
    try {
      setIsLoadingLocation(true);
      const response = await apiGet(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}/location`);
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.latitude && userData.longitude) {
          setGlobalLocation({
            latitude: parseFloat(userData.latitude),
            longitude: parseFloat(userData.longitude),
            address: userData.address || 'Your Location',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadData = async () => {
    try {
      setHasError(false);
      
      // First, get session and load user location if logged in
      const sessionResponse = await authClient.getSession();
      
      if (sessionResponse.data) {
        setSessionData(sessionResponse.data);
        // Load user's saved location from backend
        await loadUserLocation(sessionResponse.data.user.id);
      } else {
        setIsLoadingLocation(false);
      }

      // Fetch categories, restaurants, and promos in parallel (NOT popular items)
      const [categoriesResponse, restaurantsResponse, promosResponse] = await Promise.all([
        apiGet(`${process.env.EXPO_PUBLIC_API_URL}/api/categories`),
        apiGet(`${process.env.EXPO_PUBLIC_API_URL}/api/restaurants`),
        apiGet(`${process.env.EXPO_PUBLIC_API_URL}/api/promos`)
      ]);

      // Check if any request failed
      if (!categoriesResponse.ok || !restaurantsResponse.ok) {
        throw new Error('Failed to fetch data from server');
      }

      if (sessionResponse.data) {
        // Load cart items for the logged-in user
        console.log('Loading cart for user:', sessionResponse.data.user.id);
        await fetchCartItems(sessionResponse.data.user.id);
      }

      const categoriesData = await categoriesResponse.json();
      const restaurantsData = await restaurantsResponse.json();
      const promosData = promosResponse.ok ? await promosResponse.json() : [];

      setRestaurants(restaurantsData);
      setCategories(categoriesData);
      setPromos(promosData);

    } catch (error) {
      console.error("Home: Failed to load data:", error);
      setHasError(true);
      setIsLoadingLocation(false);
    } finally {
      setIsLoading(false);
      // Popular items will be loaded separately via useEffect
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch popular items when location changes
  useEffect(() => {
    // Only fetch if main loading is complete and location loading is done
    if (!isLoading && !isLoadingLocation) {
      loadPopularItems(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude, isLoading, isLoadingLocation]);

  // Refresh cart when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshCart = async () => {
        const session = await authClient.getSession();
        if (session.data?.user?.id) {
          console.log('Refreshing cart on focus for user:', session.data.user.id);
          await fetchCartItems(session.data.user.id);
        }
      };
      refreshCart();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    // Reload popular items with current location after main data is loaded
    await loadPopularItems(location.latitude, location.longitude);
    setIsRefreshing(false);
  }, [location.latitude, location.longitude]);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    loadData();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.locationContainer}>
          <View style={{backgroundColor: 'red', padding: 8, borderRadius: 30, marginRight: 10}}>
            <Ionicons name="bicycle-outline" size={28} color="white" />
          </View> 
          <TouchableOpacity onPress={() => router.push('/location-selector')} style={{ flex: 1 }} disabled={isLoadingLocation}>
            <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Delivered To</Text>
                {isLoadingLocation ? (
                  <View style={{ height: 18, width: 150, backgroundColor: '#e0e0e0', borderRadius: 4, marginTop: 2 }} />
                ) : (
                  <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">{location.address}</Text>
                )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/home/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
          {sessionData?.user?.image ? (
            <Image source={{ uri: sessionData.user.image }} style={styles.profileImage} />
          ) : (
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <Ionicons name="person-outline" size={24} color="black" />
            </TouchableOpacity>
          )}

        </View>
      </View>

      {/* Wrap the main content area in a ScrollView */}
      {isLoading ? (
        <SkeletonLoader />
      ) : hasError ? (
        <NetworkError onRetry={handleRetry} />
      ) : (
        <ScrollView 
          style={{ flex: 1, backgroundColor: '#f2f2f2' }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['red']} // Optional: customize the spinner color
            />
          }>
        <View style={{ padding: 20, backgroundColor: '#f2f2f2' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 10 }}>
            <Ionicons name="search-outline" size={24} color="gray" style={{ marginRight: 10 }} />
            <TextInput
              style={{ flex: 1, paddingVertical: 10 }} 
              placeholder="Search for restaurants, dishes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={'gray'}
              onSubmitEditing={() => router.push({ pathname: '/home/search-results', params: { query: searchQuery } })}
            />
          </View>
          {/* Promo Carousel */}
          {promos.length > 0 && (
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const slideIndex = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                  setCurrentPromoIndex(slideIndex);
                }}
                scrollEventThrottle={16}
              >
                {promos.map((promo) => (
                  <View key={promo.id} style={{ width: 350 }}>
                    <LinearGradient colors={['#FF0000', '#fa0f61']} style={styles.promoCard}>
                      <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 10 }}>{promo.headline}</Text>
                      <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Inter-Regular' }}>{promo.subheading}</Text>
                      {promo.cta && (
                        <TouchableOpacity 
                          style={{ marginTop: 10, backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, alignSelf: 'flex-start' }}
                          onPress={() => router.push({ pathname: '/home/search-results', params: { query: '' } })}
                        >
                          <Text style={{ color: '#FF0000', fontFamily: 'Inter-Bold' }}>{promo.cta}</Text>
                        </TouchableOpacity>
                      )}
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
              
              {/* Carousel Indicators */}
              {promos.length > 1 && (
                <View style={styles.indicatorContainer}>
                  {promos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        currentPromoIndex === index && styles.activeIndicator
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ paddingLeft: 20, paddingTop: 10, backgroundColor: '#f2f2f2' }}>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 10 }}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 15, paddingRight: 20 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={{ alignItems: 'center' }}
                  // Use the file-based route for the pathname and pass the dynamic part in params.
                  // This satisfies TypeScript's type-safe routing.
                  onPress={() => router.push({
                    pathname: '/home/categories/[id]', params: { id: category.id.toString(), name: category.name }
                  })}
                >
                  <View style={styles.categoryIconContainer}>
                    {category.image ? (
                      <Image source={{ uri: category.image }} style={styles.categoryImage} />
                    ) : (
                      <Ionicons name="restaurant-outline" size={30} color="#666" />
                    )}
                  </View>
                  <Text style={{ marginTop: 5, fontSize: 12, fontFamily: 'Inter-SemiBold' }}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Restaurants Section */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#f2f2f2' }}>
          <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 10 }}>Restaurants</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10, paddingRight: 20 }}>
            {restaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => router.push({ pathname: '/home/restaurants/[id]', params: { id: restaurant.id.toString(), restaurant: JSON.stringify(restaurant) } })}
              >
                <Image source={{ uri: restaurant.image || 'https://via.placeholder.com/250x120.png?text=No+Image' }} style={styles.restaurantImage} />
                <View style={styles.restaurantDetails}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="location-outline" size={14} color="gray" />
                    <Text style={styles.restaurantInfo} numberOfLines={1} ellipsizeMode="tail">
                      {restaurant.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        {/* Popular near you */}
        {isLoadingPopular ? (
          <PopularItemsSkeleton />
        ) : !hasValidLocation ? (
          <LocationNotSetCard onSetLocation={() => router.push('/location-selector')} />
        ) : (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', marginBottom: 10 }}>Popular near you</Text>
            {popularItems.length > 0 ? (
              popularItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{ backgroundColor: 'white', borderRadius: 10, marginBottom: 15, overflow: 'hidden' }}
                  onPress={() => router.push({ pathname: '/home/menu_items/[id]', params: { id: item.id.toString(), item: JSON.stringify(item) } })}
                >
                  <View>
                    <Image
                      source={{ uri: item.item_img || 'https://via.placeholder.com/400x150.png?text=No+Image' }}
                      style={{ width: '100%', height: 150 }}
                    />
                    <TouchableOpacity onPress={(e) => {
                      e.stopPropagation();
                      if (sessionData?.user?.id) {
                        handleToggleFavorite(item, sessionData.user.id);
                      }
                    }} style={styles.favoriteButton}>
                      <Ionicons
                        name={isFavorited(item.id) ? 'heart' : 'heart-outline'}
                        size={22}
                        color={'red'}
                      />
                    </TouchableOpacity>
                    <View style={{ padding: 15 }}>
                      <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold' }}>{item.name}</Text>
                      <Text style={{ color: 'gray', marginVertical: 5, fontFamily: 'Inter-Regular' }}>{item.description || 'Delicious food'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <View style={styles.starIconContainer}>
                          <Ionicons name="star" size={14} color="white" />
                        </View>
                        <Text style={{ marginLeft: 5, fontSize: 14, color: 'gray', fontFamily: 'Inter-Regular' }}>
                          {item.avgRating ? Number(item.avgRating).toFixed(1) : '0.0'} ({item.reviewsCount || 0} reviews)
                        </Text>
                      </View>
                      <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'gray', marginTop: 3 }}>
                        from {item.restaurant?.name || 'Restaurant'}
                      </Text>
                      <Text style={{ fontFamily: 'Inter-Bold', marginTop: 5 }}>{item.price} ETB</Text>
                      {item.distance && (
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'red', marginTop: 3 }}>
                          {item.distance.toFixed(1)} km away
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20, fontFamily: 'Inter-Regular' }}>
                No popular items found nearby
              </Text>
            )}
          </View>
        )}
        </ScrollView>
      )}
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomColor: '#e2e2e2',
    borderBottomWidth: 1
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow this container to grow and shrink
    marginRight: 15, // Add some space between location and icons
  },
  addressContainer: {
    flex: 1, // Allow text container to use available space
  },
  addressLabel: {
    fontFamily: 'Inter-Regular',
    color: 'gray',
  },
  addressText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
    categoryIconContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  categoryImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  icon: {
    // marginBottom: 20,
    padding: 10,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 40, height: 40, borderRadius: 20
  },

  promoCard: {
    marginTop: 20,
    borderRadius: 15,
    padding: 20,
    marginRight: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cccccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: 'red',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  starIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 2,
    paddingRight: 2,
    borderRadius: 30,
  },
  restaurantCard: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 15,
    overflow: 'hidden',
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 120,
  },
  restaurantDetails: {
    padding: 10,
  },
  restaurantName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 5,
  },
  restaurantInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'gray',
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  setLocationButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  setLocationButtonText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    fontSize: 14,
  },
});
