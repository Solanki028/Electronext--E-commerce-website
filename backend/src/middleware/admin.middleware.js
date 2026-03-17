import ApiError from '../utils/ApiError.js';

const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Admin access required. You do not have permission to perform this action.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default adminMiddleware;
