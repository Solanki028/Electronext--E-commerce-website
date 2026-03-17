import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';
import ApiError from '../utils/ApiError.js';
import { calculateCartTotals } from '../utils/calculatePricing.js';

/**
 * Get cart for a user, creating one if it doesn't exist
 */
export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('coupon');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

/**
 * Add or update item in cart
 */
export const addItemToCart = async (userId, productId, quantity, variant = null) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  if (!product.isActive) throw new ApiError(400, 'Product is not available');

  const availableStock = product.stock;
  if (availableStock < quantity) {
    throw new ApiError(400, `Only ${availableStock} units available`);
  }

  const cart = await getOrCreateCart(userId);

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
  );

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (newQty > availableStock) {
      throw new ApiError(400, `Cannot add more. Only ${availableStock} units available`);
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      discountPercent: product.discountPercent || 0,
      quantity,
      variant,
      maxStock: availableStock,
    });
  }

  await cart.save();
  return cart;
};

/**
 * Update item quantity in cart
 */
export const updateCartItem = async (userId, productId, quantity, variant = null) => {
  const cart = await getOrCreateCart(userId);
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
  );

  if (itemIndex === -1) throw new ApiError(404, 'Item not found in cart');

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, 'Product not found');
    if (quantity > product.stock) {
      throw new ApiError(400, `Only ${product.stock} units available`);
    }
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].maxStock = product.stock;
  }

  await cart.save();
  return cart;
};

/**
 * Remove item from cart
 */
export const removeItemFromCart = async (userId, productId, variant = null) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter(
    (item) =>
      !(
        item.product.toString() === productId &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
      )
  );
  await cart.save();
  return cart;
};

/**
 * Apply coupon to cart
 */
export const applyCoupon = async (userId, couponCode) => {
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

  if (!coupon) throw new ApiError(404, 'Coupon not found');
  if (!coupon.isValid) throw new ApiError(400, 'Coupon is expired or no longer valid');

  const cart = await getOrCreateCart(userId);
  const { subtotal } = calculateCartTotals(cart.items);

  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(
      400,
      `Minimum order amount ₹${coupon.minOrderAmount} required for this coupon`
    );
  }

  const userUsage = coupon.usedBy.find((u) => u.user.toString() === userId.toString());
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    throw new ApiError(400, 'You have already used this coupon the maximum number of times');
  }

  cart.coupon = coupon._id;
  cart.couponCode = coupon.code;
  await cart.save();

  return { cart, coupon };
};

/**
 * Remove coupon from cart
 */
export const removeCoupon = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.coupon = null;
  cart.couponCode = '';
  await cart.save();
  return cart;
};

/**
 * Merge guest cart (items array) into user cart after login
 */
export const mergeGuestCart = async (userId, guestItems) => {
  if (!guestItems || guestItems.length === 0) return;

  const cart = await getOrCreateCart(userId);

  for (const guestItem of guestItems) {
    const product = await Product.findById(guestItem.product);
    if (!product || !product.isActive) continue;

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === guestItem.product.toString()
    );

    if (existingIndex > -1) {
      const newQty = Math.min(
        cart.items[existingIndex].quantity + guestItem.quantity,
        product.stock
      );
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.price,
        discountPercent: product.discountPercent || 0,
        quantity: Math.min(guestItem.quantity, product.stock),
        variant: guestItem.variant || null,
        maxStock: product.stock,
      });
    }
  }

  await cart.save();
  return cart;
};

/**
 * Get cart with computed totals
 */
export const getCartWithTotals = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate('coupon').populate('items.product', 'name images price discountPercent stock isActive');

  if (!cart) return { items: [], subtotal: 0, couponDiscount: 0, total: 0 };

  // Remove items for products that are no longer available
  cart.items = cart.items.filter((item) => item.product && item.product.isActive);

  const totals = calculateCartTotals(cart.items, cart.coupon);

  return {
    ...cart.toObject(),
    ...totals,
  };
};
