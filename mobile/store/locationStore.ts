import { create } from 'zustand';

interface LocationState {
    latitude: number;
    longitude: number;
    address: string;
    setLocation: (location: { latitude: number; longitude: number; address: string }) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    latitude: 9.0054,
    longitude: 38.7636,
    address: 'Select a location',
    setLocation: (location) => set({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
    }),
}));