'use client';

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  setCredentials,
  logout as logoutAction,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAccessToken,
} from '../store/slices/authSlice';
import { clearGuestCart } from '../store/slices/cartSlice';
import { clearWishlist, setWishlist } from '../store/slices/wishlistSlice';
import authService from '../services/authService';
import api from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const accessToken = useSelector(selectAccessToken);
  const [loading, setLoading] = useState(false);

  const register = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const result = await authService.register(data);
        dispatch(setCredentials({ user: result.data.user, accessToken: result.data.accessToken }));
        if (result.data.user.wishlist) {
          dispatch(setWishlist(result.data.user.wishlist.map((p) => p._id || p)));
        }
        dispatch(clearGuestCart());
        toast.success('Registration successful! Welcome to ElectroNest 🎉');
        router.push('/');
        return { success: true };
      } catch (error) {
        const message = error?.response?.data?.message || 'Registration failed';
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [dispatch, router]
  );

  const login = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const result = await authService.login(data);
        dispatch(setCredentials({ user: result.data.user, accessToken: result.data.accessToken }));
        if (result.data.user.wishlist) {
          dispatch(setWishlist(result.data.user.wishlist.map((p) => p._id || p)));
        }
        dispatch(clearGuestCart());
        toast.success(`Welcome back, ${result.data.user.name}! 👋`);
        return { success: true };
      } catch (error) {
        const message = error?.response?.data?.message || 'Login failed';
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors, logout locally anyway
    }
    dispatch(logoutAction());
    dispatch(clearWishlist());
    toast.info('Logged out successfully');
    router.push('/');
  }, [dispatch, router]);

  const updateProfile = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await api.patch('/users/profile', data);
        dispatch(setCredentials({ user: response.data.data, accessToken }));
        toast.success('Profile updated');
        return { success: true };
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Update failed');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [dispatch, accessToken]
  );

  return {
    user,
    isAuthenticated,
    isAdmin,
    accessToken,
    loading,
    register,
    login,
    logout,
    updateProfile,
  };
};

export default useAuth;
