/**
 * Calculates final pricing for an order item/cart
 * @param {number} originalPrice
 * @param {number} discountPercent
 * @param {number} quantity
 * @returns {{ originalTotal, discountAmount, finalPrice }}
 */
export const calculateItemPricing = (originalPrice, discountPercent = 0, quantity = 1) => {
  const discountAmount = (originalPrice * discountPercent) / 100;
  const discountedPrice = originalPrice - discountAmount;
  const originalTotal = originalPrice * quantity;
  const finalPrice = Math.round(discountedPrice * quantity * 100) / 100;

  return {
    originalPrice,
    discountedPrice: Math.round(discountedPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    originalTotal: Math.round(originalTotal * 100) / 100,
    finalPrice,
    quantity,
  };
};

/**
 * Calculates cart/order totals after coupon
 * @param {Array} items - cart items with price + discountPercent + quantity
 * @param {Object|null} coupon - coupon object with type + value
 * @returns {{ subtotal, couponDiscount, total }}
 */
export const calculateCartTotals = (items, coupon = null) => {
  const subtotal = items.reduce((acc, item) => {
    const { finalPrice } = calculateItemPricing(
      item.price,
      item.discountPercent || 0,
      item.quantity
    );
    return acc + finalPrice;
  }, 0);

  let couponDiscount = 0;

  if (coupon) {
    if (coupon.discountType === 'percentage') {
      couponDiscount = Math.min(
        (subtotal * coupon.discountValue) / 100,
        coupon.maxDiscountAmount || Infinity
      );
    } else if (coupon.discountType === 'fixed') {
      couponDiscount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const total = Math.max(Math.round((subtotal - couponDiscount) * 100) / 100, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    couponDiscount: Math.round(couponDiscount * 100) / 100,
    total,
  };
};
