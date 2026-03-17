'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  toggleWishlistItem,
  selectWishlist,
  selectIsWishlisted,
} from '../store/slices/wishlistSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import api from '../services/api';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlist);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const toggle = useCallback(
    async (productId) => {
      dispatch(toggleWishlistItem(productId));

      if (isAuthenticated) {
        try {
          await api.post(`/users/wishlist/${productId}`);
        } catch {
          // Rollback on failure
          dispatch(toggleWishlistItem(productId));
          toast.error('Failed to update wishlist');
          return;
        }
      }

      const isNowWishlisted = !wishlist.includes(productId);
      toast.success(isNowWishlisted ? 'Added to wishlist ❤️' : 'Removed from wishlist');
    },
    [dispatch, wishlist, isAuthenticated]
  );

  const isWishlisted = useCallback(
    (productId) => wishlist.includes(productId),
    [wishlist]
  );

  return { wishlist, toggle, isWishlisted };
};

export default useWishlist;
