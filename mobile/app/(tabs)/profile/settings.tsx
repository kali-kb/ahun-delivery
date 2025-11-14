import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";

export default function Settings() {
    const router = useRouter();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [promotions, setPromotions] = useState(true);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="notifications-outline" size={24} color="red" />
                            <View style={styles.settingText}>
                                <Text style={styles.settingLabel}>Push Notifications</Text>
                                <Text style={styles.settingDescription}>Receive push notifications</Text>
                            </View>
                        </View>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: '#e0e0e0', true: '#ffcccc' }}
                            thumbColor={pushNotifications ? 'red' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="mail-outline" size={24} color="red" />
                            <View style={styles.settingText}>
                                <Text style={styles.settingLabel}>Email Notifications</Text>
                                <Text style={styles.settingDescription}>Receive email updates</Text>
                            </View>
                        </View>
                        <Switch
                            value={emailNotifications}
                            onValueChange={setEmailNotifications}
                            trackColor={{ false: '#e0e0e0', true: '#ffcccc' }}
                            thumbColor={emailNotifications ? 'red' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="receipt-outline" size={24} color="red" />
                            <View style={styles.settingText}>
                                <Text style={styles.settingLabel}>Order Updates</Text>
                                <Text style={styles.settingDescription}>Get notified about order status</Text>
                            </View>
                        </View>
                        <Switch
                            value={orderUpdates}
                            onValueChange={setOrderUpdates}
                            trackColor={{ false: '#e0e0e0', true: '#ffcccc' }}
                            thumbColor={orderUpdates ? 'red' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="pricetag-outline" size={24} color="red" />
                            <View style={styles.settingText}>
                                <Text style={styles.settingLabel}>Promotions & Offers</Text>
                                <Text style={styles.settingDescription}>Receive special offers</Text>
                            </View>
                        </View>
                        <Switch
                            value={promotions}
                            onValueChange={setPromotions}
                            trackColor={{ false: '#e0e0e0', true: '#ffcccc' }}
                            thumbColor={promotions ? 'red' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* App Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Preferences</Text>
                    
                    <TouchableOpacity style={styles.optionItem}>
                        <Ionicons name="language-outline" size={24} color="red" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionLabel}>Language</Text>
                            <Text style={styles.optionValue}>English</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem}>
                        <Ionicons name="moon-outline" size={24} color="red" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionLabel}>Dark Mode</Text>
                            <Text style={styles.optionValue}>Coming Soon</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* Privacy & Security */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy & Security</Text>
                    
                    <TouchableOpacity style={styles.optionItem}>
                        <Ionicons name="lock-closed-outline" size={24} color="red" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionLabel}>Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="red" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionLabel}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionItem}>
                        <Ionicons name="document-text-outline" size={24} color="red" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionLabel}>Terms of Service</Text>
                        </View>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>App Version</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 15,
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        flex: 1,
        marginLeft: 15,
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
    optionValue: {
        fontSize: 13,
        color: 'gray',
        marginTop: 2,
        fontFamily: 'Inter-Regular',
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    infoValue: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: 'gray',
    },
});
