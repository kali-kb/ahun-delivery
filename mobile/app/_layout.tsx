import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect, useRef, useMemo, useState } from 'react';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CartFAB from '../components/CartFAB';
import CartSheet from '../components/CartSheet';
import { View, Text, StyleSheet, Platform, Linking } from 'react-native';
import { useUIStore } from '../store/uiStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { authClient } from '../lib/authClient';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, savePushTokenToServer } from '../utils/notifications';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { ENV } from '../config/env';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setCartSheetOpen = useUIStore((state) => state.setCartSheetOpen);
  const fetchCartItems = useCartStore((state) => state.fetchCartItems);
  // Ref for the bottom sheet
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const openCart = () => bottomSheetModalRef.current?.present();
  const closeCart = () => bottomSheetModalRef.current?.dismiss();

  const handleSheetChanges = (index: number) => {
    // The sheet is open if the index is 0 or greater
    setCartSheetOpen(index >= 0);
  };

  useEffect(() => {
    async function loadIcons() {
      await Font.loadAsync({
        ...Ionicons.font,
      });
      setIconsLoaded(true);
    }
    loadIcons();
  }, []);

  // Set navigation bar color on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#ffffff');
      NavigationBar.setButtonStyleAsync('dark');

    }
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[Layout] Starting auth check', {
        timestamp: new Date().toISOString()
      });
      
      try {
        // Check if we're returning from OAuth by detecting app:// deep links
        const initialUrl = await Linking.getInitialURL();
        console.log('[Layout] Initial URL:', initialUrl);
        
        if (initialUrl?.startsWith('app://')) {
          console.log('[Layout] Detected OAuth callback URL (app:// deep link), setting OAuth in progress...');
          setIsOAuthInProgress(true);
          
          // Use retry logic to wait for session to be fully established
          let session = null;
          let retryCount = 0;
          const maxRetries = 5;
          const delays = [500, 800, 1000, 1200, 1500]; // Progressive delays
          
          while (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delays[retryCount]));
            
            console.log(`[Layout] Initial load attempt ${retryCount + 1}/${maxRetries}: Checking session...`);
            session = await authClient.getSession();
            
            console.log('[Layout] Session check result:', {
              hasSession: !!session,
              hasUser: !!session.data?.user,
              userId: session.data?.user?.id,
              attempt: retryCount + 1,
              timestamp: new Date().toISOString()
            });
            
            if (session?.data?.user) {
              console.log('[Layout] Session validated successfully');
              setAuthenticated(true);
              break;
            }
            
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`[Layout] Session not ready, retrying in ${delays[retryCount]}ms...`);
            }
          }
          
          if (!session?.data?.user) {
            console.error('[Layout] Session not established after OAuth on initial load', {
              retriesAttempted: maxRetries,
              timestamp: new Date().toISOString()
            });
            setAuthenticated(false);
          }
        } else {
          // Normal app launch, just check for existing session
          console.log('[Layout] Normal app launch, fetching session from authClient...');
          const session = await authClient.getSession();
          const hasSession = !!session.data?.user;
          
          console.log('[Layout] Auth check result:', {
            hasSession,
            userId: session.data?.user?.id,
            userEmail: session.data?.user?.email,
            timestamp: new Date().toISOString()
          });
          
          setAuthenticated(hasSession);
        }
      } catch (error) {
        console.error('[Layout] Auth check error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        setAuthenticated(false);
      } finally {
        setIsAuthChecked(true);
        setIsOAuthInProgress(false);
        console.log('[Layout] Auth check completed');
      }
    };
    checkAuth();
  }, [setAuthenticated]);

  // Handle navigation based on auth state
  // Updated to wait for OAuth completion before navigating
  useEffect(() => {
    console.log('[Layout] Navigation effect triggered:', {
      isAuthChecked,
      fontsLoaded,
      iconsLoaded,
      isAuthenticated,
      isOAuthInProgress,
      segments,
      timestamp: new Date().toISOString()
    });
    
    // Wait for OAuth completion before proceeding with navigation
    if (!isAuthChecked || !fontsLoaded || !iconsLoaded || isOAuthInProgress) {
      console.log('[Layout] Waiting for initialization to complete', {
        isAuthChecked,
        fontsLoaded,
        iconsLoaded,
        isOAuthInProgress
      });
      return;
    }

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not on auth screen, redirect to login
      console.log('[Layout] Redirecting to login (not authenticated)');
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screen, redirect to home
      console.log('[Layout] Redirecting to home (authenticated)');
      router.replace('/home');
    } else {
      console.log('[Layout] No navigation needed:', {
        isAuthenticated,
        inAuthGroup
      });
    }
  }, [isAuthenticated, isAuthChecked, segments, fontsLoaded, iconsLoaded, isOAuthInProgress]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && iconsLoaded && isAuthChecked) {
      // Hide the splash screen after everything is loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, iconsLoaded, isAuthChecked]);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    async function setupNotifications() {
      if (!isAuthenticated || !isAuthChecked) return;

      // Request notification permissions
      const pushToken = await registerForPushNotificationsAsync();
      
      // If we have a token, save it to server
      const session = await authClient.getSession();
      if (pushToken && session.data?.user?.id) {
        await savePushTokenToServer(
          session.data.user.id,
          pushToken,
          ENV.API_URL
        );
      }
      
      // Fetch cart items
      if (session.data?.user?.id) {
        await fetchCartItems(session.data.user.id);
      }
    }
    setupNotifications();
  }, [isAuthenticated, isAuthChecked]);

  // Setup deep link listener for OAuth callbacks
  useEffect(() => {
    console.log('[Layout] Setting up deep link listener');
    
    const subscription = Linking.addEventListener('url', async (event) => {
      console.log('[Layout] Deep link received:', {
        url: event.url,
        timestamp: new Date().toISOString(),
        isOAuthCallback: event.url.startsWith('app://')
      });
      
      // If this is an OAuth callback, set the in-progress flag and wait for session to be ready
      if (event.url.startsWith('app://')) {
        console.log('[Layout] OAuth callback detected via listener, waiting for session to be ready...');
        setIsOAuthInProgress(true);
        
        // Use retry logic to wait for session to be fully established
        let session = null;
        let retryCount = 0;
        const maxRetries = 5;
        const delays = [500, 800, 1000, 1200, 1500]; // Progressive delays
        
        while (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delays[retryCount]));
          
          console.log(`[Layout] Attempt ${retryCount + 1}/${maxRetries}: Checking session...`);
          session = await authClient.getSession();
          
          console.log('[Layout] Session check result:', {
            hasSession: !!session,
            hasUser: !!session.data?.user,
            userId: session.data?.user?.id,
            attempt: retryCount + 1,
            timestamp: new Date().toISOString()
          });
          
          if (session?.data?.user) {
            console.log('[Layout] Session validated successfully, setting authenticated');
            setAuthenticated(true);
            
            // Register push token
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken && session.data.user.id) {
              await savePushTokenToServer(
                session.data.user.id,
                pushToken,
                ENV.API_URL
              );
            }
            break;
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`[Layout] Session not ready, retrying in ${delays[retryCount]}ms...`);
          }
        }
        
        if (!session?.data?.user) {
          console.error('[Layout] Session not established after OAuth callback', {
            retriesAttempted: maxRetries,
            timestamp: new Date().toISOString()
          });
        }
        
        setIsOAuthInProgress(false);
        console.log('[Layout] OAuth callback processing complete');
      }
    });

    return () => {
      console.log('[Layout] Removing deep link listener');
      subscription.remove();
    };
  }, [setAuthenticated]);

  // Setup notification listeners
  useEffect(() => {
    // Listen for notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
    });

    // Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification tapped:', response);
      // Navigate to notifications screen when any notification is tapped
      router.push('/home/notifications');
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError || !iconsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>loading...</Text>
      </View>
    );
  }

  // Render the a root Stack component
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <BottomSheetModalProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <CartFAB onOpenCart={openCart} />
        </View>
        <BottomSheetModal ref={bottomSheetModalRef} index={0} snapPoints={snapPoints} onChange={handleSheetChanges}>
          <CartSheet onClose={closeCart} />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
});