import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: 'red' }} >
            <Tabs.Screen
                name="home"
                options={{
                    headerShown: false,
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    headerShown: false,
                    title: 'Search',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    headerShown: false,
                    title: 'Favorites',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen name="orders" options={{ headerShown: false, title: 'Orders', tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
            ), }} />
            
            <Tabs.Screen name="profile" options={{ headerShown: false, title: 'Profile', tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            ), }} />
        </Tabs>
    );
}