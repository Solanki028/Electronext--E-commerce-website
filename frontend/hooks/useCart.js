'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  setServerCart,
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestCart,
  toggleCart,
  setCartLoading,
  selectServerCart,
  selectGuestItems,
  selectIsCartOpen,
  selectCartItemCount,
  selectCartLoading,
} from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import cartService from '../services/cartService';

export const useCart = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const serverCart = useSelector(selectServerCart);
  const guestItems = useSelector(selectGuestItems);
  const isCartOpen = useSelector(selectIsCartOpen);
  const itemCount = useSelector(selectCartItemCount);
  const isLoading = useSelector(selectCartLoading);

  const cart = isAuthenticated ? serverCart : { items: guestItems };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    dispatch(setCartLoading(true));
    try {
      const result = await cartService.getCart();
      dispatch(setServerCart(result.data));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      dispatch(setCartLoading(false));
    }
  }, [isAuthenticated, dispatch]);

  const addToCart = useCallback(
    async (product, quantity = 1, variant = null) => {
      if (isAuthenticated) {
        dispatch(setCartLoading(true));
        try {
          const result = await cartService.addToCart(product._id, quantity, variant);
          dispatch(setServerCart(result.data));
          toast.success('Added to cart');
        } catch (error) {
          toast.error(error?.response?.data?.message || 'Failed to add to cart');
        } finally {
          dispatch(setCartLoading(false));
        }
      } else {
        dispatch(addGuestItem({ product, quantity, variant }));
        toast.success('Added to cart');
      }
    },
    [isAuthenticated, dispatch]
  );

  const updateQuantity = useCallback(
    async (productId, quantity, variant = null) => {
      if (isAuthenticated) {
        dispatch(setCartLoading(true));
        try {
          const result = await cartService.updateCartItem(productId, quantity, variant);
          dispatch(setServerCart(result.data));
        } catch (error) {
          toast.error(error?.response?.data?.message || 'Update failed');
        } finally {
          dispatch(setCartLoading(false));
        }
      } else {
        dispatch(updateGuestItem({ productId, quantity, variant }));
      }
    },
    [isAuthenticated, dispatch]
  );

  const removeFromCart = useCallback(
    async (productId, variant = null) => {
      if (isAuthenticated) {
        dispatch(setCartLoading(true));
        try {
          await cartService.removeFromCart(productId, variant);
          await fetchCart();
          toast.success('Item removed from cart');
        } catch (error) {
          toast.error('Failed to remove item');
        } finally {
          dispatch(setCartLoading(false));
        }
      } else {
        dispatch(removeGuestItem({ productId, variant }));
        toast.success('Item removed from cart');
      }
    },
    [isAuthenticated, dispatch, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
        dispatch(setServerCart(null));
      } catch {}
    } else {
      dispatch(clearGuestCart());
    }
  }, [isAuthenticated, dispatch]);

  const openCart = useCallback(() => dispatch(toggleCart()), [dispatch]);

  return {
    cart,
    items: cart?.items || [],
    itemCount,
    isCartOpen,
    isLoading,
    subtotal: serverCart?.subtotal || 0,
    total: serverCart?.total || 0,
    couponDiscount: serverCart?.couponDiscount || 0,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    openCart,
  };
};

export default useCart;
