import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useFavoritesStore } from "../../../../store/favoritesStore";
import { useCartStore } from "../../../../store/cartStore";
import { authClient } from "../../../../lib/authClient";
import NetworkError from "../../../../components/NetworkError";
import { apiGet } from "../../../../lib/api";



const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function MenuItemDetail() {
    const router = useRouter();
    const addItemToCart = useCartStore((state) => state.addItem);
    const favoriteItems = useFavoritesStore((state) => state.items);
    const { toggleFavorite, fetchUserFavorites } = useFavoritesStore();
    const { id: menuId } = useLocalSearchParams<{ id: string }>();
    const [item, setItem] = useState<any>(null);
    const [drinks, setDrinks] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [addingToCart, setAddingToCart] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNetworkError, setHasNetworkError] = useState<boolean>(false);
    const [selectedDrink, setSelectedDrink] = useState<any | null>(null);
    const [sessionData, setSessionData] = useState<{ user: { id: string } } | null>(null);
    const userId = sessionData?.user?.id;

    const fetchData = async () => {
        if (!menuId) return;
        setLoading(true);
        setError(null);
        setHasNetworkError(false);
        try {
            // Fetch session first
            const session = await authClient.getSession();
            if (session.data) {
                setSessionData(session.data);
                const currentUserId = session.data.user.id;
                
                // Fetch menu item, drinks, and favorites in parallel
                const [menuRes, drinksRes] = await Promise.all([
                    apiGet(`${API_URL}/api/menus/${menuId}`),
                    apiGet(`${API_URL}/api/menus/${menuId}/drinks`),
                    fetchUserFavorites(currentUserId)
                ]);
                
                if (!menuRes.ok) throw new Error('Failed to fetch');
                const data = await menuRes.json();
                setItem(data);

                if (drinksRes.ok) {
                    const drinksData = await drinksRes.json();
                    setDrinks(drinksData);
                }
            } else {
                // No session, just fetch menu item and drinks
                const [menuRes, drinksRes] = await Promise.all([
                    apiGet(`${API_URL}/api/menus/${menuId}`),
                    apiGet(`${API_URL}/api/menus/${menuId}/drinks`)
                ]);
                
                if (!menuRes.ok) throw new Error('Failed to fetch');
                const data = await menuRes.json();
                setItem(data);

                if (drinksRes.ok) {
                    const drinksData = await drinksRes.json();
                    setDrinks(drinksData);
                }
            }
        } catch (err) {
            console.error('Failed to load menu item:', err);
            setError('Unable to load menu item');
            setHasNetworkError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [menuId]);

    const handleRetry = () => {
        fetchData();
    };

    const isFavorited = (itemId: number) => favoriteItems.some(fav => fav.menuItemId === itemId);

    const handleFavoritePress = async () => {
        if (!userId || !item) return;
        await toggleFavorite(item, userId);
    };

    const handleAddToCart = async () => {
        if (!userId) {
            // Handle case where user is not logged in
            console.warn('User must be logged in to add items to cart');
            return;
        }

        setAddingToCart(true);
        try {
            if (selectedDrink) {
                await addItemToCart(selectedDrink, userId);
            }
            if (item) {
                await addItemToCart(item, userId);
            }
            router.back();
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color="red" /></View>;
    }
    
    if (hasNetworkError) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButtonError}>
                        <Ionicons name="arrow-back-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <NetworkError 
                    onRetry={handleRetry}
                    message="Unable to load menu item details. Please check your connection."
                />
            </SafeAreaView>
        );
    }
    
    if (error || !item) {
        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>{error || 'Not found'}</Text></View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.item_img }} style={styles.itemImage} />

                    {/* Circular Back Button */}
                    <TouchableOpacity onPress={() => router.back()} style={[styles.topButton, styles.backButton]}>
                        <Ionicons name="arrow-back-outline" size={24} color="black" />
                    </TouchableOpacity>
                    {/* Circular Favorite Button */}
                    <TouchableOpacity onPress={handleFavoritePress} style={[styles.topButton, styles.favoriteButton]}>
                        <Ionicons name={isFavorited(item.id) ? 'heart' : 'heart-outline'} size={24} color={'red'} />
                    </TouchableOpacity>

                    {/* Review Pill */}
                    <View style={styles.reviewPill}>
                        <Ionicons name="star" size={16} color="white" />
                        <Text style={styles.reviewPillText}>{Number(item.avgRating).toFixed(1)} ({item.reviewsCount})</Text>
                    </View>
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemRestaurant}>{item.restaurant?.name || ''}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>

                    {/* Suggested Drinks Section */}
                    <Text style={styles.sectionTitle}>Add a Drink</Text>
                    {drinks.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.drinksContainer}>
                            {drinks.map((drink) => (
                                <TouchableOpacity
                                    key={drink.id}
                                    style={[
                                        styles.drinkCard,
                                        selectedDrink?.id === drink.id && styles.drinkCardSelected
                                    ]}
                                    onPress={() => setSelectedDrink(selectedDrink?.id === drink.id ? null : drink)}
                                >
                                    <Image 
                                        source={{ uri: drink.item_img || 'https://via.placeholder.com/60x60.png?text=Drink' }} 
                                        style={styles.drinkImage} 
                                    />
                                    <Text style={styles.drinkName}>{drink.name}</Text>
                                    <Text style={styles.drinkPrice}>{drink.price} ETB</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.noDrinksCard}>
                            <Ionicons name="cafe-outline" size={40} color="#cccccc" />
                            <Text style={styles.noDrinksText}>
                                This restaurant hasn't added drinks to their menu yet
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.itemPrice}>{item.price} ETB</Text>
                <TouchableOpacity 
                    style={[styles.button, addingToCart && styles.buttonDisabled]} 
                    onPress={handleAddToCart}
                    disabled={addingToCart}
                >
                    {addingToCart ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Add to Cart</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    imageContainer: {
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: 300,
    },
    topButton: {
        position: 'absolute',
        top: 40, // Adjust for status bar height
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        left: 15,
    },
    favoriteButton: {
        right: 15,
    },
    reviewPill: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    reviewPillText: {
        color: 'white',
        marginLeft: 5,
        fontFamily: 'Inter-Bold',
    },
    detailsContainer: {
        padding: 20,
    },
    itemName: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
    },
    itemRestaurant: {
        fontSize: 16,
        color: 'gray',
        marginVertical: 5,
        fontFamily: 'Inter-Regular',
    },
    itemDescription: {
        fontSize: 14,
        color: 'gray',
        marginTop: 10,
        lineHeight: 20,
        fontFamily: 'Inter-Regular',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        marginTop: 20,
        marginBottom: 10,
    },
    drinksContainer: {
        paddingBottom: 10,
    },
    drinkCard: {
        width: 120,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        padding: 10,
        marginRight: 15,
        backgroundColor: 'white',
    },
    drinkCardSelected: {
        borderColor: 'red',
        backgroundColor: '#fff5f5',
    },
    drinkImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    drinkName: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        textAlign: 'center',
    },
    drinkPrice: {
        fontSize: 12,
        color: 'gray',
        marginTop: 4,
        fontFamily: 'Inter-Regular',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    starIconContainer: {
        backgroundColor: 'red',
        padding: 4,
        borderRadius: 20,
    },
    ratingText: {
        marginLeft: 8,
        fontSize: 14,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e2e2',
        backgroundColor: 'white',
    },
    itemPrice: {
        fontSize: 22,
        fontFamily: 'Inter-Bold',
    },
    button: {
        backgroundColor: 'red',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ffcccc',
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
    noDrinksCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    noDrinksText: {
        fontSize: 14,
        color: 'gray',
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginTop: 10,
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