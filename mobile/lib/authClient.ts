import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';




export const authClient = createAuthClient({
    baseURL: process.env.EXPO_PUBLIC_API_URL, // Base URL of your Better Auth backend.
    trustedOrigins: ["app://", "http://localhost", "exp://"],
    plugins: [
        expoClient({
            scheme: "app",
            storagePrefix: "app",
            storage: SecureStore,
        })
    ]
});