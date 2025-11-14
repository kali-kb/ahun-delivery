import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "../../../lib/authClient";
import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../../store/authStore";

interface SessionData {
    session: any;
    user: any;
}

export default function Profile() {
    const router = useRouter();
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const currentSession = await authClient.getSession();
            console.log('Profile session data:', currentSession.data);
            setSessionData(currentSession.data);
        } catch (error) {
            console.error("Failed to fetch session:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    // Refresh session when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchSession();
        }, [])
    );

    useEffect(() => {
        // Redirect if the session is checked (loading is false) and no user data is found.
        if (!loading && !sessionData?.user) {
            router.replace('/auth/login');
        }
    }, [loading, sessionData, router]);

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            setAuthenticated(false);
            router.replace('/auth/login');
        } catch (error) {
            Alert.alert("Sign Out Failed", "An error occurred while signing out.");
        }
    };

    // Mock data for profile options
    const profileOptions = [
        { icon: 'person-outline', text: 'My Account', screen: '/(tabs)/profile/account' },
        { icon: 'wallet-outline', text: 'Payment Methods', screen: '/(tabs)/profile/payment' },
        { icon: 'settings-outline', text: 'Settings', screen: '/(tabs)/profile/settings' },
        { icon: 'help-circle-outline', text: 'Help Center', screen: '/(tabs)/profile/help' },
        { icon: 'log-out-outline', text: 'Logout', action: handleSignOut, color: 'red' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="red" />
            </SafeAreaView>
        );
    }

    if (!sessionData?.user) {
        // While loading or redirecting, render nothing or a loader.
        return null; // The useEffect above will handle the redirect.
    }

    const { user } = sessionData;
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" backgroundColor="white" />
            
            {/* Header */}
            <View style={styles.header}>
                {user.image ? (
                    <Image source={{ uri: user.image }} style={styles.profileImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person-sharp" size={40} color="#FFF" />
                    </View>
                )}
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
            </View>

            {/* Menu Options */}
            <ScrollView style={styles.menuContainer}>
                {profileOptions.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.optionItem} 
                        onPress={() => (item.action ? item.action() : router.push(item.screen as any))}
                    >
                        <Ionicons name={item.icon as any} size={24} color={item.color || "red"} />
                        <Text style={[styles.optionText, { color: item.color || 'black' }]}>{item.text}</Text>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e2e2',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileName: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
    },
    profileEmail: {
        fontSize: 14,
        color: 'gray',
        marginTop: 4,
    },
    menuContainer: {
        marginTop: 10,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
    }
});
