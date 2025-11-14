import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState, useEffect, useCallback } from "react";
import { authClient } from "../../../lib/authClient";
import { useFocusEffect } from "expo-router";
import NetworkError from "../../../components/NetworkError";
import { apiGet } from "../../../lib/api";
import { ENV } from "../../../config/env";

const API_URL = ENV.API_URL;

interface MenuItem {
    id: number;
    restaurantId: number;
    item_img: string | null;
    name: string;
    categoryId: number;
    description: string | null;
    price: number;
    metadata: any;
    isAvailable: boolean;
    createdAt: string;
}

interface Order {
    id: number;
    userId: string;
    restaurantId: number;
    deliveryPersonId: string | null;
    deliveryAddress: string;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    orderItems: Array<{
        id: number;
        orderId: number;
        menuItemId: number;
        quantity: number;
        priceAtOrder: number;
        menuItem?: MenuItem;
    }>;
    restaurant: {
        id: number;
        ownerId: string;
        image: string | null;
        name: string;
        description: string | null;
        location: string;
    };
}

const getStatusStyle = (status: Order['status']) => {
    switch (status) {
        case 'delivered':
            return { color: 'green', icon: 'checkmark-circle' as const, label: 'Delivered' };
        case 'pending':
        case 'confirmed':
        case 'preparing':
        case 'out_for_delivery':
            return { color: 'red', icon: 'hourglass-outline' as const, label: 'In Progress' };
        case 'cancelled':
            return { color: 'red', icon: 'close-circle' as const, label: 'Cancelled' };
        default:
            return { color: 'gray', icon: 'help-circle' as const, label: status };
    }
};

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [loadingOrderDetails, setLoadingOrderDetails] = useState<number | null>(null);
    const [hasError, setHasError] = useState(false);

    const fetchOrders = async () => {
        try {
            setHasError(false);
            
            const session = await authClient.getSession();
            if (!session.data?.user?.id) {
                setIsLoading(false);
                return;
            }

            setUserId(session.data.user.id);

            const response = await apiGet(`${API_URL}/api/users/${session.data.user.id}/orders`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchOrders();
            }
        }, [userId])
    );

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchOrders();
        setIsRefreshing(false);
    };

    const handleRetry = () => {
        setIsLoading(true);
        setHasError(false);
        fetchOrders();
    };

    const ongoingOrders = useMemo(() => 
        orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'), 
        [orders]
    );
    const pastOrders = useMemo(() => 
        orders.filter(o => o.status === 'delivered' || o.status === 'cancelled'), 
        [orders]
    );

    const handleOrderPress = async (order: Order) => {
        if (expandedOrderId === order.id) {
            setExpandedOrderId(null);
            return;
        }

        setExpandedOrderId(order.id);
        
        // If order items don't have menuItem details, fetch them
        if (!order.orderItems[0]?.menuItem) {
            setLoadingOrderDetails(order.id);
            try {
                const response = await apiGet(`${API_URL}/api/users/${userId}/orders/${order.id}`);
                if (response.ok) {
                    const detailedOrder = await response.json();
                    setOrders(prevOrders => 
                        prevOrders.map(o => o.id === order.id ? detailedOrder : o)
                    );
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
            } finally {
                setLoadingOrderDetails(null);
            }
        }
    };

    const OrderCard = ({ order }: { order: Order }) => {
        const statusStyle = getStatusStyle(order.status);
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const isExpanded = expandedOrderId === order.id;
        const isLoadingDetails = loadingOrderDetails === order.id;

        return (
            <View style={styles.orderCardContainer}>
                <TouchableOpacity 
                    style={styles.orderCard}
                    onPress={() => handleOrderPress(order)}
                >
                    <Image 
                        source={{ uri: order.restaurant.image || 'https://via.placeholder.com/60x60.png?text=Restaurant' }} 
                        style={styles.orderImage} 
                    />
                    <View style={styles.orderDetails}>
                        <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                        <Text style={styles.orderDate}>{orderDate}</Text>
                        <View style={styles.statusContainer}>
                            <Ionicons name={statusStyle.icon} size={16} color={statusStyle.color} />
                            <Text style={[styles.orderStatus, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                        </View>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.orderTotal}>{order.totalPrice.toFixed(2)} ETB</Text>
                        <Ionicons 
                            name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
                            size={22} 
                            color="gray" 
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedSection}>
                        {isLoadingDetails ? (
                            <View style={styles.loadingDetails}>
                                <ActivityIndicator size="small" color="red" />
                                <Text style={styles.loadingText}>Loading order details...</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sectionLabel}>Order Items</Text>
                                {order.orderItems.map((item) => (
                                    <View key={item.id} style={styles.orderItemRow}>
                                        <Image 
                                            source={{ uri: item.menuItem?.item_img || 'https://via.placeholder.com/50x50.png?text=Item' }}
                                            style={styles.menuItemImage}
                                        />
                                        <View style={styles.menuItemDetails}>
                                            <Text style={styles.menuItemName}>{item.menuItem?.name || 'Menu Item'}</Text>
                                            <Text style={styles.menuItemQuantity}>Qty: {item.quantity}</Text>
                                        </View>
                                        <Text style={styles.menuItemPrice}>{item.priceAtOrder.toFixed(2)} ETB</Text>
                                    </View>
                                ))}
                                
                                <View style={styles.divider} />
                                
                                <View style={styles.addressSection}>
                                    <Text style={styles.sectionLabel}>Delivery Address</Text>
                                    <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                                </View>

                                {order.notes && (
                                    <View style={styles.notesSection}>
                                        <Text style={styles.sectionLabel}>Notes</Text>
                                        <Text style={styles.notesText}>{order.notes}</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Orders</Text>
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
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>
                <NetworkError 
                    onRetry={handleRetry}
                    message="Unable to load your orders. Please check your connection."
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={['red']}
                    />
                }
            >
                {ongoingOrders.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ongoing Orders</Text>
                        {ongoingOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </View>
                )}

                {pastOrders.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Past Orders</Text>
                        {pastOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </View>
                )}

                {orders.length === 0 && (
                     <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={80} color="#cccccc" />
                        <Text style={styles.emptyTitle}>No Orders Yet</Text>
                        <Text style={styles.emptySubtitle}>Your past and current orders will appear here.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    header: { height: 60, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e2e2' },
    headerTitle: { fontSize: 18, fontFamily: 'Inter-Bold' },
    listContainer: { paddingVertical: 10 },
    section: { marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontFamily: 'Inter-Bold', paddingHorizontal: 20, marginBottom: 10 },
    orderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15 },
    orderImage: { width: 60, height: 60, borderRadius: 8 },
    orderDetails: { flex: 1, marginLeft: 15 },
    restaurantName: { fontSize: 16, fontFamily: 'Inter-Bold' },
    orderDate: { fontSize: 13, color: 'gray', fontFamily: 'Inter-Regular', marginVertical: 4 },
    statusContainer: { flexDirection: 'row', alignItems: 'center' },
    orderStatus: { fontSize: 13, fontFamily: 'Inter-SemiBold', marginLeft: 5 },
    priceContainer: { alignItems: 'flex-end' },
    orderTotal: { fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 5 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 100,
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
    orderCardContainer: {
        marginHorizontal: 15,
        marginBottom: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    expandedSection: {
        padding: 15,
        paddingTop: 10,
        backgroundColor: '#f9f9f9',
        borderTopWidth: 1,
        borderTopColor: '#e2e2e2',
    },
    loadingDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginLeft: 10,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#333',
        marginBottom: 10,
    },
    orderItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    menuItemImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
    },
    menuItemDetails: {
        flex: 1,
        marginLeft: 10,
    },
    menuItemName: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
    },
    menuItemQuantity: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: 'gray',
        marginTop: 2,
    },
    menuItemPrice: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e2e2',
        marginVertical: 15,
    },
    addressSection: {
        marginBottom: 10,
    },
    addressText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: '#666',
        lineHeight: 18,
    },
    notesSection: {
        marginTop: 10,
    },
    notesText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: '#666',
        fontStyle: 'italic',
    },
});