import { apiGet, apiPatch, apiPost, apiDelete } from '@/lib/api';
import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface CartItem {
    id: number;
    userId: string;
    menuItemId: number;
    quantity: number;
    menuItem?: {
        id: number;
        name: string;
        item_img?: string;
        price: number;
        description?: string;
        restaurant?: {
            id: number;
            name: string;
        };
    };
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    fetchCartItems: (userId: string) => Promise<void>;
    addItem: (menuItem: any, userId: string) => Promise<void>;
    incrementQuantity: (cartItemId: number, currentQuantity: number) => Promise<void>;
    decrementQuantity: (cartItemId: number, currentQuantity: number) => Promise<void>;
    removeItem: (cartItemId: number, userId: string) => Promise<void>;
    clearCart: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    isLoading: false,

    fetchCartItems: async (userId: string) => {
        if (!userId) return;
        set({ isLoading: true });
        try {
            console.log('Fetching cart items for user:', userId);
            const response = await apiGet(`${API_URL}/api/users/${userId}/cart-items`);
            if (response.ok) {
                const data = await response.json();
                console.log('Cart items fetched:', data);
                set({ items: data });
            } else {
                console.error('Failed to fetch cart items, status:', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addItem: async (menuItem: any, userId: string) => {
        if (!userId) return;
        
        const state = get();
        const existingItem = state.items.find(item => item.menuItemId === menuItem.id);

        try {
            if (existingItem) {
                // Increment existing item
                await get().incrementQuantity(existingItem.id, existingItem.quantity);
            } else {
                // Add new item
                const response = await apiPost(`${API_URL}/api/users/${userId}/cart-items`, {
                    menuItemId: menuItem.id,
                    quantity: 1,
                });

                if (response.ok) {
                    const newCartItem = await response.json();
                    // Optimistically update the state with the new item
                    set((state) => ({
                        items: [...state.items, { 
                            ...newCartItem[0],
                            menuItem: menuItem 
                        }],
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to add item to cart:', error);
        }
    },

    incrementQuantity: async (cartItemId: number, currentQuantity: number) => {
        const newQuantity = Math.min(currentQuantity + 1, 5); // Max 5
        if (newQuantity === currentQuantity) return;

        try {
            const response = await apiPatch(`${API_URL}/api/users/temp/cart-items/${cartItemId}`, {
                quantity: newQuantity
            });

            if (response.ok) {
                set((state) => ({
                    items: state.items.map(item =>
                        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                    ),
                }));
            }
        } catch (error) {
            console.error('Failed to increment quantity:', error);
        }
    },

    decrementQuantity: async (cartItemId: number, currentQuantity: number) => {
        if (currentQuantity <= 1) {
            // Remove item if quantity would be 0
            const state = get();
            const item = state.items.find(i => i.id === cartItemId);
            if (item) {
                await get().removeItem(cartItemId, item.userId);
            }
            return;
        }

        const newQuantity = currentQuantity - 1;

        try {
            const response = await apiPatch(`${API_URL}/api/users/temp/cart-items/${cartItemId}`, {
                quantity: newQuantity
            });

            if (response.ok) {
                set((state) => ({
                    items: state.items.map(item =>
                        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                    ),
                }));
            }
        } catch (error) {
            console.error('Failed to decrement quantity:', error);
        }
    },

    removeItem: async (cartItemId: number, userId: string) => {
        try {
            const response = await apiDelete(`${API_URL}/api/users/${userId}/cart-items/${cartItemId}`);

            if (response.ok) {
                set((state) => ({
                    items: state.items.filter(item => item.id !== cartItemId),
                }));
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    },

    clearCart: async (userId: string) => {
        const state = get();
        try {
            await Promise.all(
                state.items.map(item =>
                    apiDelete(`${API_URL}/api/users/${userId}/cart-items/${item.id}`)
                )
            );
            set({ items: [] });
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    },
}));

export const selectCartItemCount = (state: CartState) => 
    state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartItems = (state: CartState) => state.items;

export const selectCartTotal = (state: CartState) => 
    state.items.reduce((total, item) => {
        const price = item.menuItem?.price || 0;
        return total + (price * item.quantity);
    }, 0);