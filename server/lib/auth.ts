import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from '../db/schema/auth';
import { expo } from "@better-auth/expo";


if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

if (!process.env.BETTER_AUTH_URL) {
    throw new Error('BETTER_AUTH_URL is not set in .env file');
}

if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is not set in .env file');
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not set in .env file');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not set in .env file');
}

// We create a separate Drizzle instance for better-auth.
// It's configured to use the auth-specific schema.
const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client, { schema: authSchema });

export const auth = betterAuth({
    plugins: [expo()],
    trustedOrigins: ["exp://", "http://localhost", "app://"],
    advanced: { 
        disableOriginCheck: true,
        useSecureCookies: false, // Important for mobile compatibility
    },
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: 'pg',
        usePlural: true,
        schema: authSchema
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders : {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,   
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    async redirect({ provider, request, callbackURL }) {
        // Log detailed debug information for OAuth redirect
        console.log('OAuth Redirect Debug:', {
            provider,
            requestUrl: request.url,
            origin: request.headers.origin || 'No origin header',
            callbackURL,
            userAgent: request.headers['user-agent'] || 'No user agent',
        });
        
        // For mobile apps, ensure we use the app scheme correctly
        if (callbackURL.startsWith('app://')) {
            console.log('Mobile app callback detected, returning:', callbackURL);
            return callbackURL;
        }
        
        // For web clients, append /home
        const redirectUrl = `${callbackURL}/home`;
        console.log('Web callback detected, returning:', redirectUrl);
        return redirectUrl;
    },
    // Add other providers or plugins as needed
    // plugins: [
    //     emailOTP()
    // ],
});