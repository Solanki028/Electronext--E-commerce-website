import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    // For authenticated users - synced with server
    serverCart: null,
    // For guest users - stored locally
    guestItems: [],
    isCartOpen: false,
    loading: false,
  },
  reducers: {
    setServerCart: (state, action) => {
      state.serverCart = action.payload;
    },
    addGuestItem: (state, action) => {
      const { product, quantity = 1, variant } = action.payload;
      const existingIndex = state.guestItems.findIndex(
        (item) =>
          item.product._id === product._id &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      if (existingIndex > -1) {
        state.guestItems[existingIndex].quantity += quantity;
      } else {
        state.guestItems.push({ product, quantity, variant: variant || null });
      }
    },
    updateGuestItem: (state, action) => {
      const { productId, quantity, variant } = action.payload;
      const index = state.guestItems.findIndex(
        (item) =>
          item.product._id === productId &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      if (index > -1) {
        if (quantity <= 0) {
          state.guestItems.splice(index, 1);
        } else {
          state.guestItems[index].quantity = quantity;
        }
      }
    },
    removeGuestItem: (state, action) => {
      const { productId, variant } = action.payload;
      state.guestItems = state.guestItems.filter(
        (item) =>
          !(
            item.product._id === productId &&
            JSON.stringify(item.variant) === JSON.stringify(variant)
          )
      );
    },
    clearGuestCart: (state) => {
      state.guestItems = [];
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action) => {
      state.isCartOpen = action.payload;
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setServerCart,
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestCart,
  toggleCart,
  setCartOpen,
  setCartLoading,
} = cartSlice.actions;

// Selectors
export const selectServerCart = (state) => state.cart.serverCart;
export const selectGuestItems = (state) => state.cart.guestItems;
export const selectIsCartOpen = (state) => state.cart.isCartOpen;
export const selectCartLoading = (state) => state.cart.loading;

export const selectCartItemCount = (state) => {
  if (state.auth.isAuthenticated) {
    return state.cart.serverCart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
  }
  return state.cart.guestItems.reduce((acc, i) => acc + i.quantity, 0);
};

export default cartSlice.reducer;
