import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import Review from '../models/Review.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      newUsersThisMonth,
      ordersThisMonth,
      revenueThisMonth,
      recentOrders,
      lowStockProducts,
      orderStatusBreakdown,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ stock: { $lte: 5 }, isActive: true }).limit(10).lean(),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: revenue[0]?.total || 0,
          newUsersThisMonth,
          ordersThisMonth,
          revenueThisMonth: revenueThisMonth[0]?.total || 0,
        },
        recentOrders,
        lowStockProducts,
        orderStatusBreakdown,
      }, 'Dashboard data retrieved')
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: new RegExp(search, 'i') } },
      { email: { $regex: new RegExp(search, 'i') } },
    ];
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json(new ApiResponse(200, { users, total }, 'Users retrieved'));
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role === 'admin') throw new ApiError(403, 'Cannot modify admin account');

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
      new ApiResponse(200, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`)
    );
  } catch (error) {
    next(error);
  }
};

export const setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) throw new ApiError(400, 'Invalid role');

    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) throw new ApiError(404, 'User not found');

    return res.status(200).json(new ApiResponse(200, user, 'User role updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) throw new ApiError(404, 'Review not found');
    return res.status(200).json(new ApiResponse(200, null, 'Review deleted by admin'));
  } catch (error) {
    next(error);
  }
};
