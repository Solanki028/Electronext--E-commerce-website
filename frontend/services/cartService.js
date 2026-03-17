import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId, quantity = 1, variant = null) => {
    const response = await api.post('/cart/items', { productId, quantity, variant });
    return response.data;
  },

  updateCartItem: async (productId, quantity, variant = null) => {
    const response = await api.patch('/cart/items', { productId, quantity, variant });
    return response.data;
  },

  removeFromCart: async (productId, variant = null) => {
    const response = await api.delete(`/cart/items/${productId}`, { data: { variant } });
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },

  applyCoupon: async (couponCode) => {
    const response = await api.post('/cart/coupon', { couponCode });
    return response.data;
  },

  removeCoupon: async () => {
    const response = await api.delete('/cart/coupon');
    return response.data;
  },
};

export default cartService;
