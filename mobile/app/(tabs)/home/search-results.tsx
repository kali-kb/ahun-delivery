import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useEffect } from "react";
import { useFavoritesStore } from "../../../store/favoritesStore";
import { authClient } from "../../../lib/authClient";
import { apiGet } from "../../../lib/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface MenuItem {
    id: number;
    restaurantId: number;
    item_img: string | null;
    name: string;
    categoryId: number;
    description: string | null;
    price: number;
    isAvailable: boolean;
    createdAt: string;
}

const FilterChip = ({ label, selected, onPress }: { label: string, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.filterChip, selected && styles.filterChipSelected]}
        onPress={onPress}
    >
        <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
);

const SkeletonLoader = () => (
    <View style={styles.listContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.itemContainer}>
                <View style={[styles.itemImage, { backgroundColor: '#e0e0e0' }]} />
                <View style={styles.itemDetails}>
                    <View style={{ height: 20, width: '80%', backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
                    <View style={{ height: 16, width: '60%', backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
                    <View style={{ height: 16, width: '40%', backgroundColor: '#e0e0e0', borderRadius: 4 }} />
                </View>
            </View>
        ))}
    </View>
);

export default function SearchResults() {
    const router = useRouter();
    const { query } = useLocalSearchParams<{ query: string }>();
    const [filters, setFilters] = useState({
        vegetarian: false,
        maxPrice: null as number | null,
    });
    const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionData, setSessionData] = useState<{ user: { id: string } } | null>(null);

    const favoriteItems = useFavoritesStore((state) => state.items);
    const { toggleFavorite, fetchUserFavorites } = useFavoritesStore();
    const userId = sessionData?.user?.id;

    const isFavorited = (itemId: number) => favoriteItems.some(fav => fav.menuItemId === itemId);
    const handleToggleFavorite = async (item: MenuItem) => {
        if (!userId) return;
        await toggleFavorite(item, userId);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch session
                const session = await authClient.getSession();
                if (session.data) {
                    setSessionData(session.data);
                    await fetchUserFavorites(session.data.user.id);
                }

                // Build query params - if query is empty, fetch all menus
                let url = `${API_URL}/api/menus/search?query=${encodeURIComponent(query || '')}`;
                if (filters.vegetarian) {
                    url += '&isVegetarian=true';
                }
                if (filters.maxPrice) {
                    url += `&maxPrice=${filters.maxPrice}`;
                }

                // Fetch search results
                const response = await apiGet(url);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error('Failed to fetch search results:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [query, filters]);

    const toggleVegetarian = () => {
        setFilters(prev => ({ ...prev, vegetarian: !prev.vegetarian }));
    };

    const setPriceFilter = (price: number | null) => {
        setFilters(prev => ({ ...prev, maxPrice: price }));
    };

    const clearFilters = () => {
        setFilters({ vegetarian: false, maxPrice: null });
    };

    const hasActiveFilters = filters.vegetarian || filters.maxPrice !== null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {query ? `Search: "${query}"` : 'All Items'}
                </Text>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
                    <TouchableOpacity
                        style={[styles.filterChip, filters.vegetarian && styles.filterChipSelected]}
                        onPress={toggleVegetarian}
                    >
                        <Ionicons name="leaf-outline" size={16} color={filters.vegetarian ? 'white' : '#666'} />
                        <Text style={[styles.filterChipText, filters.vegetarian && styles.filterChipTextSelected]}>Vegetarian</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterChip, filters.maxPrice === 200 && styles.filterChipSelected]}
                        onPress={() => setPriceFilter(filters.maxPrice === 200 ? null : 200)}
                    >
                        <Ionicons name="cash-outline" size={16} color={filters.maxPrice === 200 ? 'white' : '#666'} />
                        <Text style={[styles.filterChipText, filters.maxPrice === 200 && styles.filterChipTextSelected]}>Under 200</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterChip, filters.maxPrice === 500 && styles.filterChipSelected]}
                        onPress={() => setPriceFilter(filters.maxPrice === 500 ? null : 500)}
                    >
                        <Ionicons name="cash-outline" size={16} color={filters.maxPrice === 500 ? 'white' : '#666'} />
                        <Text style={[styles.filterChipText, filters.maxPrice === 500 && styles.filterChipTextSelected]}>Under 500</Text>
                    </TouchableOpacity>

                    {hasActiveFilters && (
                        <TouchableOpacity style={styles.clearFilterChip} onPress={clearFilters}>
                            <Ionicons name="close-circle" size={16} color="#666" />
                            <Text style={styles.clearFilterText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>

            {isLoading ? (
                <SkeletonLoader />
            ) : (
                <ScrollView contentContainerStyle={styles.listContainer}>
                    {searchResults.length > 0 ? searchResults.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemContainer}
                            onPress={() => router.push({ pathname: '/home/menu_items/[id]', params: { id: item.id.toString(), item: JSON.stringify(item) } })}
                        >
                            <Image source={{ uri: item.item_img || 'https://via.placeholder.com/400x150.png?text=No+Image' }} style={styles.itemImage} />
                            <TouchableOpacity onPress={() => handleToggleFavorite(item)} style={styles.favoriteButton}>
                                <Ionicons name={isFavorited(item.id) ? 'heart' : 'heart-outline'} size={22} color={'red'} />
                            </TouchableOpacity>
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{item.price} ETB</Text>
                            </View>
                        </TouchableOpacity>
                    )) : (
                        <Text style={styles.noItemsText}>
                            {query ? `No results found for "${query}"` : 'No items available'}
                        </Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    header: { height: 60, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e2e2', flexDirection: 'row' },
    backButton: { position: 'absolute', left: 20, zIndex: 1 },
    headerTitle: { fontSize: 18, fontFamily: 'Inter-Bold' },
    filterContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e2e2', paddingVertical: 12 },
    filterScrollContent: { paddingHorizontal: 15, gap: 10 },
    filterChip: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6,
        paddingVertical: 8, 
        paddingHorizontal: 16, 
        borderRadius: 20, 
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterChipSelected: { 
        backgroundColor: '#ff0000',
        borderColor: '#ff0000',
    },
    filterChipText: { 
        color: '#666', 
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
    },
    filterChipTextSelected: { 
        color: 'white', 
        fontFamily: 'Inter-SemiBold',
    },
    clearFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    clearFilterText: {
        color: '#666',
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
    },
    listContainer: { paddingHorizontal: 15, paddingVertical: 10 },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemImage: { width: '100%', height: 150 },
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
    },
    itemDetails: { padding: 15, fontFamily: 'Inter-Regular' },
    itemName: { fontSize: 18, fontFamily: 'Inter-Bold' },
    itemRestaurant: { fontSize: 14, color: 'gray', marginVertical: 4 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { marginLeft: 5, fontSize: 14, color: 'gray' },
    itemPrice: { fontFamily: 'Inter-Bold', fontSize: 16, marginTop: 8 },
    noItemsText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
});