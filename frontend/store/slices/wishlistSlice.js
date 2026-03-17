import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [], // Array of product IDs or product objects
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    toggleWishlistItem: (state, action) => {
      const productId = action.payload;
      const index = state.items.indexOf(productId);
      if (index > -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(productId);
      }
    },
    addToWishlist: (state, action) => {
      if (!state.items.includes(action.payload)) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((id) => id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  setWishlist,
  toggleWishlistItem,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export const selectWishlist = (state) => state.wishlist.items;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.includes(productId);

export default wishlistSlice.reducer;
