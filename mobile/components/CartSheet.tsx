import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore, selectCartItems, selectCartTotal } from '../store/cartStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CartSheetProps {
    onClose?: () => void;
}

export default function CartSheet({ onClose }: CartSheetProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const cartItems = useCartStore(selectCartItems);
    const { incrementQuantity, decrementQuantity } = useCartStore();
    const cartTotal = useCartStore(selectCartTotal);
    const deliveryCost = 30; // Fixed delivery cost

    // This function tells the FlatList how to get a unique key for each item.
    const keyExtractor = (item: any) => `cart-item-${item.id}`;

    const handleIncrement = (cartItemId: number, currentQuantity: number) => 
        incrementQuantity(cartItemId, currentQuantity);
    
    const handleDecrement = (cartItemId: number, currentQuantity: number) => 
        decrementQuantity(cartItemId, currentQuantity);

    const renderItem = ({ item }: { item: any }) => {
        const menuItem = item.menuItem;
        if (!menuItem) return null;

        return (
            <View style={styles.itemContainer}>
                <Image 
                    source={{ uri: menuItem.item_img || 'https://via.placeholder.com/60x60.png?text=Item' }} 
                    style={styles.itemImage} 
                />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{menuItem.name}</Text>
                    <Text style={styles.itemPrice}>ETB {menuItem.price.toFixed(2)}</Text>
                </View>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => handleDecrement(item.id, item.quantity)}>
                        <Ionicons name="remove-circle-outline" size={24} color="gray" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleIncrement(item.id, item.quantity)}>
                        <Ionicons name="add-circle-outline" size={24} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Cart</Text>
            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={60} color="#cccccc" />
                    <Text style={styles.emptyText}>Your cart is empty.</Text>
                </View>
            ) : (
                <>
                    <BottomSheetFlatList
                        data={cartItems}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.listContainer}
                    />
                    <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                        <View style={styles.costRow}>
                            <Text style={styles.costLabel}>Food Cost</Text>
                            <Text style={styles.costValue}>ETB {cartTotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.costRow}>
                            <Text style={styles.costLabel}>Delivery</Text>
                            <Text style={styles.costValue}>ETB {deliveryCost.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.costRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>ETB {(cartTotal + deliveryCost).toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.checkoutButton}
                            onPress={() => {
                                onClose?.();
                                router.push({
                                    pathname: '/payment',
                                    params: {
                                        foodCost: cartTotal.toString(),
                                        deliveryCost: deliveryCost.toString(),
                                    }
                                });
                            }}
                        >
                            <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 10,
    },
    itemName: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    itemPrice: {
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 16,
        marginHorizontal: 10,
        fontFamily: 'Inter-Bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    footerContainer: {
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e2e2e2',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: 'gray',
    },
    costValue: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e2e2e2',
    },
    totalLabel: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
    },
    totalValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
    },
    checkoutButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    checkoutButtonText: {
        color: 'white',
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
});