import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

/**
 * SSR-safe storage: returns a no-op storage on the server (where localStorage
 * does not exist) and the real localStorage-backed storage in the browser.
 * This eliminates the "redux-persist failed to create sync storage" warning.
 */
const createNoopStorage = () => ({
  getItem:    (_key) => Promise.resolve(null),
  setItem:    (_key, value) => Promise.resolve(value),
  removeItem: (_key) => Promise.resolve(),
});

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'accessToken', 'isAuthenticated'],
};

const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['guestItems'],
};

const wishlistPersistConfig = {
  key: 'wishlist',
  storage,
  whitelist: ['items'],
};

const rootReducer = combineReducers({
  auth:     persistReducer(authPersistConfig,     authReducer),
  cart:     persistReducer(cartPersistConfig,     cartReducer),
  wishlist: persistReducer(wishlistPersistConfig, wishlistReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
