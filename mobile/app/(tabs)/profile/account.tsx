import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "../../../lib/authClient";
import React, { useEffect, useState } from "react";
import NetworkError from "../../../components/NetworkError";
import { apiPatch } from "../../../lib/api";

export default function MyAccount() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [hasError, setHasError] = useState(false);

    const fetchUser = async () => {
        try {
            setHasError(false);
            setLoading(true);
            
            const session = await authClient.getSession();
            if (session.data?.user) {
                const userData = session.data.user as any;
                setUser(userData);
                setName(userData.name || '');
                setEmail(userData.email || '');
                setPhone(userData.phone || '');
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleRetry = () => {
        fetchUser();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiPatch(`${ENV.API_URL}/api/users/${user.id}`, {
                name,
                phone
            });
            
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setName(user.name || '');
        setPhone(user.phone || '');
        setIsEditing(false);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="red" />
            </SafeAreaView>
        );
    }

    if (hasError) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back-outline" size={28} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Account</Text>
                </View>
                <NetworkError 
                    onRetry={handleRetry}
                    message="Unable to load your account information. Please check your connection."
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Account</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Profile Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        {!isEditing && (
                            <TouchableOpacity 
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Ionicons name="pencil-outline" size={20} color="red" />
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {!isEditing ? (
                        // Display Mode
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="person-outline" size={20} color="red" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Full Name</Text>
                                    <Text style={styles.infoValue}>{name || 'Not set'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="mail-outline" size={20} color="red" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{email}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoIconContainer}>
                                    <Ionicons name="call-outline" size={20} color="red" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Phone Number</Text>
                                    <Text style={styles.infoValue}>{phone || 'Not set'}</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        // Edit Mode
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={[styles.input, styles.disabledInput]}
                                    value={email}
                                    editable={false}
                                    placeholder="Enter your email"
                                />
                                <Text style={styles.helperText}>Email cannot be changed</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter your phone number"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity 
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>

                {/* Account Stats */}
                {!isEditing && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Statistics</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Ionicons name="receipt-outline" size={24} color="red" />
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Total Orders</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="heart-outline" size={24} color="red" />
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Favorites</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="star-outline" size={24} color="red" />
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Reviews</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
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
        height: 60,
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
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: 'white',
        marginTop: 15,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#fff5f5',
    },
    editButtonText: {
        color: 'red',
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: 'gray',
        fontFamily: 'Inter-Regular',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
    helperText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 4,
        fontFamily: 'Inter-Regular',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: 'gray',
        marginTop: 4,
        fontFamily: 'Inter-Regular',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    saveButton: {
        flex: 1,
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#ffcccc',
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
});
