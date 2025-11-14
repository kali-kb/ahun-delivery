import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";

export default function PaymentMethods() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState('telebirr');

    // Placeholder payment methods
    const paymentMethods = [
        {
            id: 'telebirr',
            name: 'Telebirr',
            icon: 'phone-portrait-outline',
            description: 'Pay with Telebirr mobile wallet',
            color: '#FF6B00',
        },
        {
            id: 'cbe',
            name: 'CBE Birr',
            icon: 'card-outline',
            description: 'Pay with Commercial Bank of Ethiopia',
            color: '#1E40AF',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color="#1E40AF" />
                    <Text style={styles.infoText}>
                        Select your preferred payment method. You can change this anytime.
                    </Text>
                </View>

                {/* Payment Methods List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Payment Methods</Text>
                    
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentCard,
                                selectedMethod === method.id && styles.paymentCardSelected
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: method.color + '20' }]}>
                                <Ionicons name={method.icon as any} size={32} color={method.color} />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={styles.paymentName}>{method.name}</Text>
                                <Text style={styles.paymentDescription}>{method.description}</Text>
                            </View>
                            <View style={styles.radioButton}>
                                {selectedMethod === method.id && (
                                    <View style={styles.radioButtonInner} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Coming Soon Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Coming Soon</Text>
                    <View style={styles.comingSoonCard}>
                        <Ionicons name="time-outline" size={24} color="gray" />
                        <View style={styles.comingSoonInfo}>
                            <Text style={styles.comingSoonText}>More payment methods</Text>
                            <Text style={styles.comingSoonDescription}>
                                We're working on adding more payment options
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Payment Method</Text>
                </TouchableOpacity>
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
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#1E40AF',
        fontFamily: 'Inter-Regular',
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
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        marginBottom: 15,
    },
    paymentCardSelected: {
        borderColor: 'red',
        backgroundColor: '#fff5f5',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentInfo: {
        flex: 1,
        marginLeft: 15,
    },
    paymentName: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        marginBottom: 4,
    },
    paymentDescription: {
        fontSize: 13,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'red',
    },
    comingSoonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    comingSoonInfo: {
        flex: 1,
        marginLeft: 15,
    },
    comingSoonText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        color: 'gray',
        marginBottom: 4,
    },
    comingSoonDescription: {
        fontSize: 13,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    saveButton: {
        backgroundColor: 'red',
        margin: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
});
