import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SuccessModal from '../components/SuccessModal';
import { useLocationStore } from '../store/locationStore';
import { authClient } from '../lib/authClient';
import { apiPost } from '../lib/api';
import { ENV } from '../config/env';

const API_URL = ENV.API_URL;

export default function PaymentScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const location = useLocationStore();
    
    const foodCost = parseFloat(params.foodCost as string) || 0;
    const deliveryCost = parseFloat(params.deliveryCost as string) || 30;
    const total = foodCost + deliveryCost;

    const [reference, setReference] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get user ID
        const getUser = async () => {
            const session = await authClient.getSession();
            if (session.data?.user?.id) {
                console.log(`session ${session.data?.user?.id}`)
                setUserId(session.data.user.id);
            }
        };
        getUser();
    }, []);

    const handleVerifyPayment = async () => {
        if (!reference.trim()) {
            Alert.alert('Error', 'Please enter a payment reference');
            return;
        }

        if (!userId) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        setIsVerifying(true);
        try {
            // Step 1: Verify payment
            const paymentResponse = await apiPost(`${API_URL}/api/payments/verify-telebirr`, {
                reference: reference.trim()
            });

            if (!paymentResponse.ok) {
                const error = await paymentResponse.json();
                Alert.alert('Verification Failed', error.message || 'Unable to verify payment');
                return;
            }

            // Step 2: Create orders for all restaurants in cart
            const orderResponse = await apiPost(`${API_URL}/api/users/${userId}/orders/bulk`, {
                deliveryAddress: location.address,
                notes: `Payment Reference: ${reference.trim()}`,
            });

            if (!orderResponse.ok) {
                const error = await orderResponse.json();
                Alert.alert('Order Creation Failed', error.message || 'Unable to create order');
                return;
            }

            const orders = await orderResponse.json();
            console.log('Orders created:', orders);
            
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Payment/Order error:', error);
            Alert.alert('Error', 'Failed to process payment. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="dark" backgroundColor="white" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}>
                {/* Telebirr Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: 'https://res.cloudinary.com/do264t6b4/image/upload/v1762625861/telebirr_sfhuio.jpg' }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.paymentMethod}>Telebirr Payment</Text>
                </View>

                {/* Order Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Food Cost</Text>
                        <Text style={styles.summaryValue}>ETB {foodCost.toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery</Text>
                        <Text style={styles.summaryValue}>ETB {deliveryCost.toFixed(2)}</Text>
                    </View>
                    
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>ETB {total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Payment Instructions */}
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                    <Text style={styles.instructionsText}>
                        1. Open your Telebirr app{'\n'}
                        2. Complete the payment of ETB {total.toFixed(2)}{'\n'}
                        3. Copy the payment reference number{'\n'}
                        4. Enter the reference below and verify
                    </Text>
                </View>

                {/* Reference Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Payment Reference</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter reference (e.g., CE626EJRNS)"
                        value={reference}
                        placeholderTextColor={'gray'}
                        onChangeText={setReference}
                        autoCapitalize="characters"
                        editable={!isVerifying}
                    />
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                    onPress={handleVerifyPayment}
                    disabled={isVerifying}
                >
                    {isVerifying ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Verify Payment</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
            </KeyboardAvoidingView>

            <SuccessModal
                visible={showSuccessModal}
                title="Orders Placed!"
                message="Your payment has been verified and all orders have been placed successfully. Thank you!"
                onClose={() => {
                    setShowSuccessModal(false);
                    router.replace('/home');
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e2e2',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    paymentMethod: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        color: '#333',
    },
    summaryContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: 'gray',
    },
    summaryValue: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e2e2e2',
    },
    totalLabel: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
    },
    totalValue: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        color: 'red',
    },
    instructionsContainer: {
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    instructionsTitle: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
        marginBottom: 6,
        color: '#856404',
    },
    instructionsText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#856404',
        lineHeight: 18,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        borderWidth: 1,
        borderColor: '#e2e2e2',
    },
    verifyButton: {
        backgroundColor: 'red',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    verifyButtonDisabled: {
        opacity: 0.6,
    },
    verifyButtonText: {
        color: 'white',
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
});
