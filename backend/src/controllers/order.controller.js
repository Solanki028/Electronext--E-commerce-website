import Order from '../models/Order.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { createOrderFromCart, updateOrderStatus } from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await createOrderFromCart(req.user._id, shippingAddress, paymentMethod);
    return res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        orders,
        pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
      }, 'Orders retrieved')
    );
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new ApiError(404, 'Order not found');
    return res.status(200).json(new ApiResponse(200, order, 'Order retrieved'));
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) throw new ApiError(404, 'Order not found');

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new ApiError(400, `Cannot cancel order with status "${order.status}"`);
    }

    const updated = await updateOrderStatus(req.params.id, 'cancelled', reason || 'Customer requested cancellation', req.user._id);
    return res.status(200).json(new ApiResponse(200, updated, 'Order cancelled'));
  } catch (error) {
    next(error);
  }
};

// Admin controllers
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.orderNumber = { $regex: new RegExp(search, 'i') };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json(new ApiResponse(200, { orders, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } }, 'Orders retrieved'));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { status, comment, trackingNumber } = req.body;
    const order = await updateOrderStatus(req.params.id, status, comment, req.user._id);

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
      await order.save();
    }

    return res.status(200).json(new ApiResponse(200, order, 'Order status updated'));
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) throw new ApiError(404, 'Order not found');
    return res.status(200).json(new ApiResponse(200, order, 'Order retrieved'));
  } catch (error) {
    next(error);
  }
};
