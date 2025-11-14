import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect, useRef, useMemo, useState } from 'react';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CartFAB from '../components/CartFAB';
import CartSheet from '../components/CartSheet';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
      try {
        const session = await authClient.getSession();
        const hasSession = !!session.data?.user;
        setAuthenticated(hasSession);
      } catch (error) {
        setAuthenticated(false);
      } finally {
        setIsAuthChecked(true);
      }
    };
    checkAuth();
  }, [setAuthenticated]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isAuthChecked || !fontsLoaded || !iconsLoaded) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not on auth screen, redirect to login
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screen, redirect to home
      router.replace('/home');
    }
  }, [isAuthenticated, isAuthChecked, segments, fontsLoaded, iconsLoaded]);

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