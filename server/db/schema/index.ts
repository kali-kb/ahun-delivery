
import { users, sessions, accounts, verifications } from './auth';
import { categories} from './categories';
import { menus, menusRelations } from './menus';
import { restaurants } from './restaurants';
import { favorites, favoritesRelations } from './favorites';
import { orders, ordersRelations } from './orders';
import { orderItems, orderItemsRelations } from './order-items';
import { promo } from './promo';
import { orderStatusEnum as orderStatus } from './enums/order-status';
import { UserRole as userRole } from './enums/user-role'
import { notifications } from './notifications';
import { restaurantRatings } from './restaurant-ratings';
import { menuRatings } from './menu-ratings';
import { cartItems, cartItemsRelations } from './cart-items';
import * as auth from './auth';

// Export all tables for Drizzle Kit to detect
export {
  // Categories
  categories,
  
  // Menus
  menus,

  orderStatus,
  
  // Restaurants
  restaurants,
  
  // Favorites
  favorites,
  
  userRole,
  
  // Orders
  orders,
  
  // Order Items
  orderItems,
  
  // Promo
  promo,
  
  // Notifications
  notifications,
  
  // Restaurant Ratings
  restaurantRatings,
  
  // Menu Ratings
  menuRatings,
  
  // Cart Items
  cartItems,
  
  // Auth
  users,
  sessions,
  accounts,
  verifications,
  
};

// Export schema for Drizzle ORM
export const schema = {
  categories,
  menus,
  menusRelations,
  restaurants,
  favorites,
  favoritesRelations,
  orders,
  ordersRelations,
  orderItems,
  orderItemsRelations,
  promo,
  orderStatus,
  notifications,
  restaurantRatings,
  menuRatings,
  cartItems,
  cartItemsRelations,
  ...auth,
};
