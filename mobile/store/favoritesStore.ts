import { create } from 'zustand';
import { apiGet, apiPost, apiDelete } from '../lib/api';
import { ENV } from '../config/env';

interface MenuItem {
    id: number;
    name: string;
    [key: string]: any;
}

interface FavoriteItem {
    id: number;
    menuItemId: number;
    userId: string;
    createdAt: string;
    menuItem?: MenuItem;
}

interface FavoritesState {
    items: FavoriteItem[];
    toggleFavorite: (item: MenuItem, userId: string) => Promise<void>;
    fetchUserFavorites: (userId: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    items: [],
    toggleFavorite: async (item, userId) => {
        if (!userId) {
            console.error('User not authenticated');
            return;
        }

        const existingFavorite = get().items.find(fav => fav.menuItemId === item.id);
        console.log('Toggle favorite - existing:', existingFavorite, 'itemId:', item.id);
        
        try {
            if (existingFavorite) {
                // Optimistically remove from UI first
                console.log('Removing favorite optimistically');
                set((state) => ({
                    items: state.items.filter(fav => fav.menuItemId !== item.id)
                }));
                
                // Then make API call
                const response = await apiDelete(`${ENV.API_URL}/api/users/${userId}/favorites/${existingFavorite.id}`);
                
                // If API call fails, revert the optimistic update
                if (!response.ok) {
                    set((state) => ({
                        items: [...state.items, existingFavorite]
                    }));
                    console.error('Failed to remove favorite');
                }
            } else {
                // Optimistically add to UI first with temporary data INCLUDING menuItem
                const tempFavorite: FavoriteItem = {
                    id: Date.now(), // Temporary ID
                    menuItemId: item.id,
                    userId: userId,
                    createdAt: new Date().toISOString(),
                    menuItem: item // Include the full menu item for display
                };
                
                console.log('Adding favorite optimistically:', tempFavorite);
                set((state) => {
                    const newItems = [...state.items, tempFavorite];
                    console.log('New items after add:', newItems.length);
                    return { items: newItems };
                });
                
                // Then make API call
                const response = await apiPost(`${ENV.API_URL}/api/users/${userId}/favorites`, {
                    menuItemId: item.id
                });
                
                if (response.ok) {
                    const newFavorite = await response.json();
                    console.log('Server response:', newFavorite);
                    // Replace temp favorite with real one from server (which includes menuItem from the API)
                    set((state) => ({
                        items: state.items.map(fav => 
                            fav.id === tempFavorite.id ? newFavorite[0] : fav
                        )
                    }));
                } else {
                    // If API call fails, remove the optimistic update
                    console.error('Failed to add favorite - reverting');
                    set((state) => ({
                        items: state.items.filter(fav => fav.id !== tempFavorite.id)
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            // Revert optimistic update on error
            if (existingFavorite) {
                set((state) => ({
                    items: [...state.items, existingFavorite]
                }));
            } else {
                set((state) => ({
                    items: state.items.filter(fav => fav.menuItemId !== item.id)
                }));
            }
        }
    },
    fetchUserFavorites: async (userId) => {
        try {
            const response = await apiGet(`${ENV.API_URL}/api/users/${userId}/favorites`);
            if (response.ok) {
                const favorites = await response.json();
                set({ items: favorites });
            }
        } catch (error) {
            console.error('Failed to fetch user favorites:', error);
        }
    },
}));