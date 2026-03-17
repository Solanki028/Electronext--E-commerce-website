import Cart from '../models/Cart.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  getCartWithTotals,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  applyCoupon,
  removeCoupon,
} from '../services/cart.service.js';
import { calculateCartTotals } from '../utils/calculatePricing.js';

export const getCart = async (req, res, next) => {
  try {
    const cartData = await getCartWithTotals(req.user._id);
    return res.status(200).json(new ApiResponse(200, cartData, 'Cart retrieved'));
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const cart = await addItemToCart(req.user._id, productId, Number(quantity), variant);
    const totals = calculateCartTotals(cart.items);
    return res.status(200).json(new ApiResponse(200, { ...cart.toObject(), ...totals }, 'Item added to cart'));
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQty = async (req, res, next) => {
  try {
    const { productId, quantity, variant } = req.body;
    const cart = await updateCartItem(req.user._id, productId, Number(quantity), variant);
    const totals = calculateCartTotals(cart.items);
    return res.status(200).json(new ApiResponse(200, { ...cart.toObject(), ...totals }, 'Cart updated'));
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { variant } = req.body;
    const cart = await removeItemFromCart(req.user._id, productId, variant);
    return res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null, couponCode: '' });
    return res.status(200).json(new ApiResponse(200, null, 'Cart cleared'));
  } catch (error) {
    next(error);
  }
};

export const applyCouponToCart = async (req, res, next) => {
  try {
    const { couponCode } = req.body;
    const { cart, coupon } = await applyCoupon(req.user._id, couponCode);
    const totals = calculateCartTotals(cart.items, coupon);
    return res.status(200).json(
      new ApiResponse(200, { ...cart.toObject(), ...totals, coupon }, 'Coupon applied')
    );
  } catch (error) {
    next(error);
  }
};

export const removeCouponFromCart = async (req, res, next) => {
  try {
    const cart = await removeCoupon(req.user._id);
    return res.status(200).json(new ApiResponse(200, cart, 'Coupon removed'));
  } catch (error) {
    next(error);
  }
};
