import Stack from "expo-router/stack";

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* <Stack.Screen name="category-menu" options={{ headerShown: false }} /> */}
            <Stack.Screen name="categories/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="search-results" options={{ headerShown: false }} />
            <Stack.Screen name="restaurants/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="menu_items/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
