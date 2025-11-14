import { create } from 'zustand';

interface UIState {
    isCartSheetOpen: boolean;
    setCartSheetOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCartSheetOpen: false,
    setCartSheetOpen: (isOpen) => set({ isCartSheetOpen: isOpen }),
}));