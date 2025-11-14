import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useCartStore, selectCartItemCount } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';

interface CartFABProps {
    onOpenCart: () => void;
}

const CartFAB = ({ onOpenCart }: CartFABProps) => {
    const pathname = usePathname();
    const cartItemCount = useCartStore(selectCartItemCount);
    const cartItems = useCartStore((state) => state.items);
    const isCartSheetOpen = useUIStore((state) => state.isCartSheetOpen);

    console.log('CartFAB - Count:', cartItemCount, 'Items:', cartItems.length, 'Pathname:', pathname);

    // We don't want to show the FAB on the location selector screen, payment screen, auth screens, or if the cart is empty.
    if (
        isCartSheetOpen || 
        pathname === '/location-selector' || 
        pathname === '/payment' || 
        pathname.startsWith('/auth/') || 
        cartItemCount === 0 || 
        pathname.startsWith('/home/menu_items/')
    ) {
        return null;
    }

    return (
        <TouchableOpacity style={styles.fab} onPress={onOpenCart}>
            <Ionicons name="cart" size={24} color="white" />
            {cartItemCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemCount}</Text>
            </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 120,
        backgroundColor: 'red',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 10,
    },
    badge: {
        position: 'absolute',
        right: -2,
        top: -2,
        backgroundColor: 'red',
        borderRadius: 10,
        borderWidth : 1,
        borderColor: 'white',
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default CartFAB;