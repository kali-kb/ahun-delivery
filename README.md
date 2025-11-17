# Ahun Delivery 🍔🚀

A modern, full-stack food delivery application built with cutting-edge technologies for seamless ordering and delivery experiences.

![Ahun Delivery Screenshots](https://res.cloudinary.com/do264t6b4/image/upload/v1763368847/Screenshot_20251117-113846_Ahun_Delivery_m82h4v.jpg)

## Overview

Ahun Delivery is a comprehensive food delivery platform that connects users with local restaurants. The app features real-time location tracking, push notifications, secure authentication, and a smooth ordering experience.

## Screenshots

<div style="display: flex; gap: 10px;">
  <img src="https://res.cloudinary.com/do264t6b4/image/upload/v1763368847/Screenshot_20251117-113846_Ahun_Delivery_m82h4v.jpg" width="250" alt="Home Screen" />
  <img src="https://res.cloudinary.com/do264t6b4/image/upload/v1763368848/Screenshot_20251117-113939_Ahun_Delivery_fairve.jpg" width="250" alt="Restaurant View" />
  <img src="https://res.cloudinary.com/do264t6b4/image/upload/v1763368847/Screenshot_20251117-113923_Ahun_Delivery_jtcjkl.jpg" width="250" alt="Menu Items" />
</div>

## Tech Stack

### Backend (`/server`)
- **Framework:** NestJS
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better-Auth with Google OAuth
- **Real-time:** Push Notifications (Firebase Cloud Messaging)
- **Payment Processing:** Integrated payment gateway
- **API:** RESTful API architecture

### Mobile Client (`/mobile`)
- **Framework:** Expo (React Native)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand
- **Maps:** Mapbox GL
- **Location Services:** Expo Location API
- **Push Notifications:** Expo Notifications
- **Authentication:** Better-Auth client with OAuth support
- **UI Components:** React Native with custom components

## Features

### User Features
- 🔐 Secure authentication (Email/Password & Google OAuth)
- 📍  location tracking and address management
- 📝 Order placement and management
- 🛒 Shopping cart with real-time updates
- ❤️ Favorites management
- 🔔 Push notifications for order updates
- 💳 Reciept based payment processing(using Telebirr)



## Project Structure

```
ahun-delivery/
├── server/              # NestJS backend
│   ├── src/
│   │   ├── auth/       # Authentication module
│   │   ├── cart-items/ # Cart management
│   │   ├── categories/ # Category management
│   │   ├── favorites/  # Favorites module
│   │   ├── menus/      # Menu items management
│   │   ├── orders/     # Order processing
│   │   ├── payments/   # Payment integration
│   │   ├── promo/      # Promo codes
│   │   ├── push-notifications/ # FCM integration
│   │   ├── restaurants/ # Restaurant management
│   │   └── user/       # User management
│   ├── db/             # Database schemas
│   └── lib/            # Shared utilities
│
└── mobile/             # Expo mobile app
    ├── app/            # App screens (file-based routing)
    │   ├── (tabs)/    # Tab navigation
    │   └── auth/      # Authentication screens
    ├── components/     # Reusable components
    ├── store/          # Zustand state management
    ├── lib/            # API clients and utilities
    └── assets/         # Images and static files
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ahun_delivery
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Mobile Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

4. Start the Expo development server:
```bash
npx expo start
```

5. Run on Android:
```bash
npx expo run:android
```

6. Run on iOS (macOS only):
```bash
npx expo run:ios
```

## Building for Production

### Backend
```bash
cd server
npm run build
npm run start:prod
```

### Mobile

Build for Android:
```bash
cd mobile
eas build --platform android --profile production
```

Build for iOS:
```bash
cd mobile
eas build --platform ios --profile production
```

## Environment Variables

### Server
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_URL` - Backend URL for authentication
- `BETTER_AUTH_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Mobile
- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox access token for maps

## About

This is a personal project built to explore modern full-stack development with NestJS and Expo. Feel free to explore the code and use it as a reference for your own projects!

---

Built with ❤️ using NestJS and Expo
