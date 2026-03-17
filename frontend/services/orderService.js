import api from './api';

export const orderService = {
  createOrder: async (shippingAddress, paymentMethod = 'cod') => {
    const response = await api.post('/orders', { shippingAddress, paymentMethod });
    return response.data;
  },

  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id, reason = '') => {
    const response = await api.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Admin
  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getAdminOrderById: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status, comment = '', trackingNumber = '') => {
    const response = await api.patch(`/admin/orders/${id}/status`, {
      status,
      comment,
      trackingNumber,
    });
    return response.data;
  },
};

export default orderService;
