import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Token from '../models/Token.model.js';
import ApiError from '../utils/ApiError.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new ApiError(401, 'Access token is missing');

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token has expired');
      }
      throw new ApiError(401, 'Invalid access token');
    }

    const user = await User.findById(decoded._id).select('-password');
    if (!user) throw new ApiError(401, 'User not found');
    if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
