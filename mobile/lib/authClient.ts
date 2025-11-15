import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { ENV } from '../config/env';
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';

// Log auth client initialization
console.log('[AuthClient] Initializing auth client with config:', {
    baseURL: ENV.API_URL,
    trustedOrigins: ["app://", "http://localhost", "exp://"],
    scheme: "app",
    storagePrefix: "app",
    timestamp: new Date().toISOString()
});

export const authClient = createAuthClient({
    baseURL: ENV.API_URL, // Base URL of your Better Auth backend.
    trustedOrigins: ["app://", "http://localhost", "exp://"],
    plugins: [
        expoClient({
            scheme: "app",
            storagePrefix: "app",
            storage: SecureStore,
        })
    ]
});

console.log('[AuthClient] Auth client initialized successfully');