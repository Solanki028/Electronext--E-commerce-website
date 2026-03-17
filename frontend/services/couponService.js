import api from './api';

export const couponService = {
  validateCoupon: async (code, orderAmount) => {
    const response = await api.get('/coupons/validate', {
      params: { code, orderAmount },
    });
    return response.data;
  },

  getAllCoupons: async (params = {}) => {
    const response = await api.get('/coupons', { params });
    return response.data;
  },

  createCoupon: async (data) => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  updateCoupon: async (id, data) => {
    const response = await api.put(`/coupons/${id}`, data);
    return response.data;
  },

  deleteCoupon: async (id) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
};

export default couponService;
