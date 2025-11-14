import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useEffect, useState } from "react";
import { useLocationStore } from "../../../../store/locationStore";
import { getDistance } from "../../../../utils/distance"
import { useFavoritesStore } from "../../../../store/favoritesStore";
import { authClient } from "../../../../lib/authClient";
import NetworkError from "../../../../components/NetworkError";
import { apiGet } from "../../../../lib/api";
import { ENV } from "@/config/env";

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    item_img: string | null;
}

interface Restaurant {
    id: number;
    name: string;
    image: string | null;
    avgRating: string;
    ratingCount: string;
    latitude?: number;
    longitude?: number;
    menus: MenuItem[];
}

export default function RestaurantDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    const { data: sessionData } = authClient.useSession();
    const userId = sessionData?.user?.id;

    const userLocation = useLocationStore();
    const { items: favoriteItems, toggleFavorite } = useFavoritesStore();

    const distance = useMemo(() => {
        if (userLocation.latitude && userLocation.longitude && restaurant?.latitude && restaurant.longitude) {
            return getDistance(userLocation.latitude, userLocation.longitude, restaurant.latitude, restaurant.longitude);
        }
        return null;
    }, [userLocation, restaurant]);

    const handleToggleFavorite = (item: any) => toggleFavorite(item, userId || '');
    const isFavorited = (itemId: number) => favoriteItems.some(fav => fav.menuItemId === itemId);

    const fetchRestaurantDetails = async () => {
        if (!id) return;
        try {
            setHasError(false);
            setIsLoading(true);
            const response = await apiGet(`${ENV.API_URL}/api/restaurants/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch restaurant details');
            }
            const data = await response.json();
            setRestaurant(data);
        } catch (error) {
            console.error("Failed to fetch restaurant details:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurantDetails();
    }, [id]);

    const handleRetry = () => {
        fetchRestaurantDetails();
    };

    if (isLoading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="red" /></View>;
    }

    if (hasError) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButtonError}>
                        <Ionicons name="arrow-back-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <NetworkError 
                    onRetry={handleRetry}
                    message="Unable to load restaurant details. Please check your connection."
                />
            </SafeAreaView>
        );
    }

    if (!restaurant) {
        return <View style={styles.loadingContainer}><Text>Restaurant not found.</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView>
                <ImageBackground source={{ uri: restaurant.image || 'https://via.placeholder.com/400x250.png?text=No+Image' }} style={styles.headerImage}>
                    <View style={styles.overlay}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back-outline" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerDetails}>
                            <Text style={styles.headerTitle}>{restaurant.name}</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="star" size={16} color={restaurant.avgRating && Number(restaurant.avgRating) > 0 ? "red" : "gray"} />
                                <Text style={styles.infoText}>
                                    {Number(restaurant.avgRating).toFixed(1)} ({restaurant.ratingCount} review{restaurant.ratingCount !== '1' ? 's' : ''})
                                </Text>
                                {distance && (
                                    <>
                                        <Text style={styles.infoText}>•</Text>
                                        <Ionicons name="location-outline" size={16} color="white" />
                                        <Text style={styles.infoText}>{distance.toFixed(1)} km away</Text>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </ImageBackground>

                <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    {(() => {
                        const validMenus = restaurant.menus?.filter(item => item !== null) || [];
                        return validMenus.length > 0 ? (
                            validMenus.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.itemContainer}
                                    onPress={() => router.push({ pathname: '/home/menu_items/[id]', params: { id: item.id.toString(), item: JSON.stringify(item) } })}
                                >
                                    <Image source={{ uri: item.item_img || 'https://via.placeholder.com/150.png?text=No+Image' }} style={styles.itemImage} />
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                                        <Text style={styles.itemPrice}>{item.price} ETB</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleToggleFavorite(item)} style={styles.favoriteButton}>
                                        <Ionicons name={isFavorited(item.id) ? 'heart' : 'heart-outline'} size={22} color={'red'} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20, fontFamily: 'Inter-Regular' }}>
                                No menu items available
                            </Text>
                        );
                    })()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    headerImage: { width: '100%', height: 250 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'space-between', padding: 15, paddingTop: 40 },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerDetails: {},
    headerTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: 'white', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    infoText: { color: 'white', fontFamily: 'Inter-SemiBold', fontSize: 14 },
    menuContainer: { padding: 20, backgroundColor: '#f2f2f2' },
    menuTitle: { fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 15 },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemImage: { width: 80, height: 80, borderRadius: 10 },
    itemDetails: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 16, fontFamily: 'Inter-Bold' },
    itemDescription: { fontSize: 13, color: 'gray', fontFamily: 'Inter-Regular', marginVertical: 4 },
    itemPrice: { fontSize: 14, fontFamily: 'Inter-Bold', marginTop: 5 },
    favoriteButton: {
        padding: 5,
    },
    errorHeader: {
        height: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e2e2',
    },
    backButtonError: {
        position: 'absolute',
        left: 20,
        backgroundColor: '#f0f0f0',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});