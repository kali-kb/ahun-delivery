import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Mapbox from '@rnmapbox/maps';
import React, { useEffect, useState } from "react";
import * as Location from 'expo-location';
import { useLocationStore } from "../store/locationStore";
import { authClient } from "../lib/authClient";
import { apiPatch } from "../lib/api";
import { ENV } from "../config/env";

// --- IMPORTANT ---
// Replace this with your own public Mapbox access token
const MAPBOX_ACCESS_TOKEN = ENV.MAPBOX_ACCESS_TOKEN || null;
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function LocationSelector() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const setGlobalLocation = useLocationStore((state) => state.setLocation);
    
    const [markerLocation, setMarkerLocation] = useState({
        latitude: 9.0054, // Default to Addis Ababa
        longitude: 38.7636,
    });
    const [currentAddress, setCurrentAddress] = useState('Fetching address...');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            try {
                let userLocation = await Location.getCurrentPositionAsync({});
                const newMarkerLocation = {
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                };
                setMarkerLocation(newMarkerLocation);
                await updateAddress(newMarkerLocation.latitude, newMarkerLocation.longitude);
            } catch (error) {
                console.error("Error fetching initial location:", error);
                Alert.alert("Location Unavailable", "Could not fetch your current location automatically. Please select a location on the map manually.");
                setCurrentAddress('Addis Ababa, Ethiopia');
            }
        })();
    }, []);

    const updateAddress = async (lat: number, lon: number) => {
        try {
            const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            const plusCode = address.name || '';
            const displayAddress = [plusCode, address.city].filter(Boolean).join(', ').trim() || 'Picked Location';
            setCurrentAddress(displayAddress);
            return displayAddress;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            setCurrentAddress('Unknown location');
            return 'Unknown location';
        }
    };

    const onPickLocation = async () => {
        if (!markerLocation) return;
        
        setIsLoading(true);
        try {
            // Get address
            const displayAddress = await updateAddress(markerLocation.latitude, markerLocation.longitude);

            // Update local store
            setGlobalLocation({ 
                latitude: markerLocation.latitude, 
                longitude: markerLocation.longitude, 
                address: displayAddress 
            });

            // Save to backend if user is logged in
            const session = await authClient.getSession();
            if (session.data?.user?.id) {
                await apiPatch(`${ENV.API_URL}/api/users/${session.data.user.id}/location`, {
                    latitude: markerLocation.latitude.toString(),
                    longitude: markerLocation.longitude.toString(),
                    address: displayAddress,
                });
            }

            router.back();
        } catch (error) {
            console.error('Error saving location:', error);
            Alert.alert('Error', 'Failed to save location. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const onMapPress = async (feature: any) => {
        if (feature.geometry.type === 'Point') {
            const [longitude, latitude] = feature.geometry.coordinates;
            setMarkerLocation({ latitude, longitude });
            await updateAddress(latitude, longitude);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Custom Header to respect SafeAreaView */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Location</Text>
            </View>

            <Mapbox.MapView style={styles.map} styleURL={Mapbox.StyleURL.Street} onPress={onMapPress}>
                <Mapbox.Camera
                    zoomLevel={14}
                    centerCoordinate={[markerLocation.longitude, markerLocation.latitude]}
                    animationMode={'flyTo'}
                    animationDuration={1500}
                />
                <Mapbox.PointAnnotation
                    anchor={{ x: 0.5, y: 0.5 }} // Anchor to the center of the view
                    id="marker"
                    coordinate={[markerLocation.longitude, markerLocation.latitude]}
                    draggable
                    onDragEnd={onMapPress}
                >
                    <View style={styles.markerCircle}>
                        <Ionicons name="location-sharp" size={20} color="white" />
                    </View>
                </Mapbox.PointAnnotation>
            </Mapbox.MapView>

            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                {/* Location Info Card */}
                <View style={styles.locationCard}>
                    <View style={styles.locationIconContainer}>
                        <Ionicons name="location" size={24} color="red" />
                    </View>
                    <View style={styles.locationTextContainer}>
                        <Text style={styles.locationLabel}>Selected Location</Text>
                        <Text style={styles.locationAddress} numberOfLines={2}>{currentAddress}</Text>
                    </View>
                </View>

                {/* Pick Location Button */}
                <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={onPickLocation}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Pick Location</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 60, // Standard header height
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
    map: {
        flex: 1,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        right: 20,
    },
    locationCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    locationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    locationTextContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: 'gray',
        fontFamily: 'Inter-Regular',
        marginBottom: 2,
    },
    locationAddress: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Inter-SemiBold',
    },
    button: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
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
    markerCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 4,
        // Add a subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    
});