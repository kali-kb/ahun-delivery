import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavoritesStore } from "../../../../store/favoritesStore";
import React, { useEffect, useState } from "react";
import { authClient } from "../../../../lib/authClient";
import NetworkError from "../../../../components/NetworkError";
import { apiGet } from "../../../../lib/api";
import { ENV } from "@/config/env";



interface MenuItem {
    id: number;
    restaurantId: number;
    item_img: string | null;
    name: string;
    categoryId: number;
    description: string | null;
    price: number;
    isAvailable: boolean;
    restaurant: {
        name: string;
    };
    avgRating: number;
    reviewsCount: string; // Count is a string from the DB
    isFavorited: boolean;
}

interface CategoryDetails {
    id: number;
    name: string;
    image: string | null;
    description: string | null;
    menus: MenuItem[];
}

export default function CategoryMenu() {
    const router = useRouter();
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
    const [categoryData, setCategoryData] = useState<CategoryDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [sessionData, setSessionData] = useState<{ user: { id: string } } | null>(null);
    const userId = sessionData?.user?.id;
    const favoriteItems = useFavoritesStore((state) => state.items);
    const { toggleFavorite, fetchUserFavorites } = useFavoritesStore();

    const handleToggleFavorite = async (item: MenuItem) => {
        if (!userId) return;
        await toggleFavorite(item, userId);
    };
    
    const isFavorited = (itemId: number) => {
        const favorited = favoriteItems.some(fav => fav.menuItemId === itemId);
        return favorited;
    };

    const fetchData = async () => {
        if (!id) return;
        try {
            setHasError(false);
            setIsLoading(true);
            
            // Fetch session data first
            const session = await authClient.getSession();
            if (session.data) {
                setSessionData(session.data);
                const currentUserId = session.data.user.id;
                // Fetch category details and favorites in parallel
                const [categoryResponse] = await Promise.all([
                    apiGet(`${ENV.API_URL}/api/categories/${id}`),
                    fetchUserFavorites(currentUserId)
                ]);
                
                if (!categoryResponse.ok) {
                    throw new Error('Failed to fetch category details');
                }
                
                const data = await categoryResponse.json();
                // Filter out invalid menu items (null or missing id)
                if (data && Array.isArray(data.menus)) {
                    data.menus = data.menus.filter((menu: MenuItem) => menu && menu.id);
                }
                setCategoryData(data);
            } else {
                // No session, just fetch category without userId
                const response = await apiGet(`${ENV.API_URL}/api/categories/${id}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch category details');
                }
                
                const data = await response.json();
                // Filter out invalid menu items (null or missing id)
                if (data && Array.isArray(data.menus)) {
                    data.menus = data.menus.filter((menu: MenuItem) => menu && menu.id);
                }
                setCategoryData(data);
            }
        } catch (error) {
            console.error("Failed to fetch category details:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleRetry = () => {
        fetchData();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{name}</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            ) : hasError ? (
                <NetworkError 
                    onRetry={handleRetry}
                    message="Unable to load category items. Please check your connection."
                />
            ) : (
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {categoryData && Array.isArray(categoryData.menus) && categoryData.menus.length > 0 ? (
                        <>
                            {categoryData.menus.map((item) => (
                                <TouchableOpacity
                                    key={`menu-item-${item.id}`}
                                    style={styles.itemContainer}
                                    onPress={() => router.push({
                                        pathname: '/home/menu_items/[id]',
                                        params: { id: item.id.toString(), item: JSON.stringify(item) }
                                    })}
                                >
                                    <Image source={{ uri: item.item_img || 'https://via.placeholder.com/400x150.png?text=No+Image' }} style={styles.itemImage} />
                                    <TouchableOpacity 
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleToggleFavorite(item);
                                        }} 
                                        style={styles.favoriteButton}
                                    >
                                        <Ionicons
                                            name={isFavorited(item.id) ? 'heart' : 'heart-outline'}
                                            size={22}
                                            color={'red'}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.restaurantName}>from {item.restaurant.name}</Text>
                                        <View style={styles.ratingContainer}>
                                            <Ionicons name="star" size={14} color="red" />
                                            <Text style={styles.ratingText}>
                                                {item.avgRating ? Number(item.avgRating).toFixed(1) : "0.0"} ({item.reviewsCount ? item.reviewsCount : '0'} review{item.reviewsCount !== '1' ? 's' : ''})
                                            </Text>
                                        </View>
                                        <Text style={styles.itemPrice}>{item.price} ETB</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </>
                    ) : (
                        <Text style={styles.noItemsText}>No items available for this category yet.</Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    header: {
        height: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e2e2',
    },
    backButton: {
        position: 'absolute',
        left: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
        // Add shadow for depth
        elevation:  1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemDetails: {
        padding: 15,
    },
    itemName: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    itemDescription: {
        fontSize: 14,
        color: 'gray',
        marginVertical: 4,
        fontFamily: 'Inter-Regular',
    },
    itemPrice: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        marginTop: 8,
    },
    restaurantName: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: 'gray',
        marginBottom: 5,
    },
    itemImage: {
        width: '100%',
        height: 150,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 14,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
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
    noItemsText: {
        textAlign: 'center',
        marginTop: 50,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});