import Coupon from '../models/Coupon.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.query;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isValid) throw new ApiError(404, 'Invalid or expired coupon');
    if (orderAmount && Number(orderAmount) < coupon.minOrderAmount) {
      throw new ApiError(400, `Minimum order ₹${coupon.minOrderAmount} required`);
    }

    // Check user limit
    const userUsage = coupon.usedBy.find((u) => u.user.toString() === req.user._id.toString());
    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      throw new ApiError(400, 'Coupon usage limit reached');
    }

    return res.status(200).json(
      new ApiResponse(200, {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        description: coupon.description,
      }, 'Coupon is valid')
    );
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const [coupons, total] = await Promise.all([
      Coupon.find().sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)),
      Coupon.countDocuments(),
    ]);
    return res.status(200).json(new ApiResponse(200, { coupons, total }, 'Coupons retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    return res.status(201).json(new ApiResponse(201, coupon, 'Coupon created'));
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) throw new ApiError(404, 'Coupon not found');
    return res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new ApiError(404, 'Coupon not found');
    return res.status(200).json(new ApiResponse(200, null, 'Coupon deleted'));
  } catch (error) {
    next(error);
  }
};
