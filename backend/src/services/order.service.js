import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import Cart from '../models/Cart.model.js';
import Coupon from '../models/Coupon.model.js';
import ApiError from '../utils/ApiError.js';
import { calculateCartTotals, calculateItemPricing } from '../utils/calculatePricing.js';

/**
 * Generate a unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EN-${timestamp}-${random}`;
};

/**
 * Create an order from the user's cart
 */
export const createOrderFromCart = async (userId, shippingAddress, paymentMethod = 'cod') => {
  const cart = await Cart.findOne({ user: userId }).populate('coupon').populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Validate stock and lock prices
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${item.name}" is no longer available`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for "${product.name}". Available: ${product.stock}`
      );
    }

    const pricing = calculateItemPricing(product.price, product.discountPercent, item.quantity);

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      slug: product.slug,
      price: product.price,
      discountPercent: product.discountPercent || 0,
      discountedPrice: pricing.discountedPrice,
      quantity: item.quantity,
      variant: item.variant || undefined,
      sku: product.sku,
    });
  }

  const coupon = cart.coupon;
  const totals = calculateCartTotals(cart.items, coupon);
  const shippingCost = totals.subtotal >= 999 ? 0 : 49;
  const tax = Math.round(totals.total * 0.18 * 100) / 100; // 18% GST
  const grandTotal = Math.round((totals.total + shippingCost + tax) * 100) / 100;

  // Create order
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: userId,
    items: orderItems,
    shippingAddress,
    subtotal: totals.subtotal,
    couponCode: cart.couponCode || '',
    couponDiscount: totals.couponDiscount,
    shippingCost,
    tax,
    total: grandTotal,
    paymentMethod,
    statusHistory: [{ status: 'pending', comment: 'Order placed successfully' }],
  });

  // Deduct stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Increment coupon usage
  if (coupon) {
    await Coupon.findByIdAndUpdate(coupon._id, {
      $inc: { usageCount: 1 },
      $push: { usedBy: { user: userId, count: 1 } },
    });
  }

  // Clear cart
  await Cart.findByIdAndUpdate(cart._id, {
    items: [],
    coupon: null,
    couponCode: '',
  });

  return order;
};

/**
 * Update order status with history tracking
 */
export const updateOrderStatus = async (orderId, status, comment = '', adminId) => {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: [],
  };

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  const allowed = validTransitions[order.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Cannot transition order from "${order.status}" to "${status}"`);
  }

  order.status = status;
  order.statusHistory.push({ status, comment, updatedBy: adminId });

  if (status === 'delivered') order.deliveredAt = new Date();
  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    order.cancelReason = comment;

    // Restock items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }
  }

  await order.save();
  return order;
};
