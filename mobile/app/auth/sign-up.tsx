import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authClient } from '../../lib/authClient';
import { useAuthStore } from '../../store/authStore';
import { registerForPushNotificationsAsync, savePushTokenToServer } from '../../utils/notifications';
import { ENV } from '../../config/env';

const ValidationCheck = ({ text, isValid }: { text: string, isValid: boolean }) => (
    <View style={styles.validationRow}>
        <Ionicons name={isValid ? "checkmark-circle" : "close-circle-outline"} size={20} color={isValid ? "green" : "gray"} />
        <Text style={[styles.validationText, { color: isValid ? "green" : "gray" }]}>{text}</Text>
    </View>
);


export default function SignUpScreen() {
    const router = useRouter();
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        symbol: false,
    });

    useEffect(() => {
        setPasswordValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const handleSignUp = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        
        const isPasswordValid = Object.values(passwordValidations).every(Boolean);
        if (!isPasswordValid) {
            Alert.alert('Weak Password', 'Please ensure your password meets all the requirements.');
            return;
        }

        setLoading(true);
        try {
            const name = email.split('@')[0];
            const { error } = await authClient.signUp.email({
                email: email,
                name: name,
                password: password,
            },
        );

            if (error) {
                console.log('Sign Up Error:', error)
                throw error;
            }
            
            setAuthenticated(true);
            
            // Register push token after successful sign up
            const session = await authClient.getSession();
            if (session.data?.user?.id) {
                const pushToken = await registerForPushNotificationsAsync();
                if (pushToken) {
                    await savePushTokenToServer(
                        session.data.user.id,
                        pushToken,
                        ENV.API_URL
                    );
                }
            }
            
            router.replace('/home');
        } catch (error: any) {
            Alert.alert('Sign Up Failed', error.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        console.log('[SignUp] Google Sign-In initiated', {
            timestamp: new Date().toISOString(),
            callbackURL: 'app://',
            provider: 'google'
        });
        
        try {
            console.log('[SignUp] Calling authClient.signIn.social...');
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: 'app://',
            });
            
            console.log('[SignUp] OAuth browser flow completed');
            // The _layout.tsx will handle the deep link callback and session validation
            // We just need to wait here and let the OAuth flow complete naturally
            
        } catch (error: any) {
            // Log all auth failures with full context
            console.error('[SignUp] Google Sign-In error:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                errorObject: error,
                timestamp: new Date().toISOString(),
                context: 'handleGoogleSignIn catch block'
            });
            
            // Distinguish between user cancellation and actual errors
            const errorMessage = error.message?.toLowerCase() || '';
            const isCancellation = 
                errorMessage.includes('cancel') || 
                errorMessage.includes('dismissed') || 
                errorMessage.includes('user_cancelled') ||
                errorMessage.includes('user cancelled') ||
                errorMessage.includes('abort');
            
            if (isCancellation) {
                // User cancelled - don't show error alert
                console.log('[SignUp] User cancelled Google sign-in - no alert shown');
            } else {
                // Actual error - show specific error message to user
                let userMessage = 'Could not complete Google sign-in. Please try again.';
                
                // Provide specific error messages for known scenarios
                if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
                    userMessage = 'Authentication timed out. Please check your internet connection and try again.';
                    console.error('[SignUp] Timeout error detected', {
                        originalMessage: error.message,
                        timestamp: new Date().toISOString()
                    });
                } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                    userMessage = 'Network error. Please check your internet connection and try again.';
                    console.error('[SignUp] Network error detected', {
                        originalMessage: error.message,
                        timestamp: new Date().toISOString()
                    });
                } else if (errorMessage.includes('session')) {
                    userMessage = error.message || 'Session could not be established. Please try again.';
                    console.error('[SignUp] Session error detected', {
                        originalMessage: error.message,
                        timestamp: new Date().toISOString()
                    });
                } else if (error.message) {
                    // Use the original error message if it's informative
                    userMessage = error.message;
                    console.error('[SignUp] Generic error with message', {
                        originalMessage: error.message,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    console.error('[SignUp] Unknown error without message', {
                        error: error,
                        timestamp: new Date().toISOString()
                    });
                }
                
                Alert.alert('Sign In Failed', userMessage);
            }
        } finally {
            setLoading(false);
            console.log('[SignUp] Google Sign-In flow completed (finally block)', {
                timestamp: new Date().toISOString()
            });
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started with Ahun Delivery</Text>
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
                    
                    {password.length > 0 && (
                        <View style={styles.validationContainer}>
                            <ValidationCheck
                                text="At least 8 characters"
                                isValid={passwordValidations.length} />
                            <ValidationCheck
                                text="Contains an uppercase letter"
                                isValid={passwordValidations.uppercase} />
                            <ValidationCheck
                                text="Contains a lowercase letter"
                                isValid={passwordValidations.lowercase} />
                            <ValidationCheck
                                text="Contains a symbol (!@#...)"
                                isValid={passwordValidations.symbol} />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                placeholderTextColor="#999"
                                secureTextEntry={!isConfirmPasswordVisible}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                                <Ionicons name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.signUpButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.separatorContainer}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>OR</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
                        <Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Sign up with Google</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/auth/login')}>
                    <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkHighlight}>Log In</Text></Text>
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
    signUpButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    signUpButtonText: {
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
    loginLink: {
        marginTop: 20,
    },
    loginLinkText: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: 'gray',
    },
    loginLinkHighlight: {
        color: 'red',
        fontFamily: 'Inter-Bold',
    },
    validationContainer: {
        marginTop: -10,
        marginBottom: 20,
        paddingLeft: 5,
    },
    validationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    validationText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
});