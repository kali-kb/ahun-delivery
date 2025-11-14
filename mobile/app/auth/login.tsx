import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authClient } from '../../lib/authClient';
import { useAuthStore } from '../../store/authStore';
import { registerForPushNotificationsAsync, savePushTokenToServer } from '../../utils/notifications';

export default function LoginScreen() {
    const router = useRouter();
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await authClient.signIn.email({
                email: email,
                password: password,
            });

            if (error) {
                throw error;
            }

            setAuthenticated(true);
            
            // Register push token after successful login
            const session = await authClient.getSession();
            if (session.data?.user?.id) {
                const pushToken = await registerForPushNotificationsAsync();
                if (pushToken) {
                    await savePushTokenToServer(
                        session.data.user.id,
                        pushToken,
                        process.env.EXPO_PUBLIC_API_URL || ''
                    );
                }
            }
            
            router.replace('/home');
        } catch (error: any) {
            Alert.alert('Sign In Failed', error.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async() => {
        setLoading(true);
        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: 'app://',
            });
            setAuthenticated(true);
            
            // Register push token after successful login
            const session = await authClient.getSession();
            if (session.data?.user?.id) {
                const pushToken = await registerForPushNotificationsAsync();
                if (pushToken) {
                    await savePushTokenToServer(
                        session.data.user.id,
                        pushToken,
                        process.env.EXPO_PUBLIC_API_URL || ''
                    );
                }
            }
            
            router.replace('/home');
        } catch (error: any) {
            // This catch block will run if the user cancels the sign-in from the browser.
            console.log("Google Sign-In cancelled or failed:", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" backgroundColor="#f2f2f2" />
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Sign in to continue with Ahun Delivery</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#999"
                                secureTextEntry={!isPasswordVisible}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                                <Ionicons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading} >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>OR</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
                        <Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.signUpLink} onPress={() => router.replace('/auth/sign-up')}>
                    <Text style={styles.signUpLinkText}>Don't have an account? <Text style={styles.signUpLinkHighlight}>Sign Up</Text></Text>
                </TouchableOpacity>
            </ScrollView>
            </KeyboardAvoidingView>


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Inter-Bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
    },
    form: {
        width: '100%',
        maxWidth: 400,
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Inter-SemiBold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: '#333',
    },
    eyeIcon: {
        paddingHorizontal: 10,
    },
    signInButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    signInButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    separatorText: {
        marginHorizontal: 10,
        color: 'gray',
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    googleButtonText: {
        color: '#555',
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    signUpLink: {
        marginTop: 20,
    },
    signUpLinkText: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: 'gray',
    },
    signUpLinkHighlight: {
        color: 'red',
        fontFamily: 'Inter-Bold',
    },
});