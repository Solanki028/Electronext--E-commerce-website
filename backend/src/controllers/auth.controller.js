import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Token from '../models/Token.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { generateTokenPair, generateRefreshToken } from '../utils/generateTokens.js';
import { mergeGuestCart } from '../services/cart.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store refresh token in DB
    await Token.create({
      user: user._id,
      token: refreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Merge guest cart if provided
    if (req.body.guestCart && Array.isArray(req.body.guestCart)) {
      await mergeGuestCart(user._id, req.body.guestCart).catch(() => {});
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        { user: user.toJSON(), accessToken },
        'Registration successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, guestCart } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid email or password');
    if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated');

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) throw new ApiError(401, 'Invalid email or password');

    const { accessToken, refreshToken } = generateTokenPair(user);

    await Token.create({
      user: user._id,
      token: refreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Merge guest cart
    if (guestCart && Array.isArray(guestCart)) {
      await mergeGuestCart(user._id, guestCart).catch(() => {});
    }

    return res.status(200).json(
      new ApiResponse(200, { user: user.toJSON(), accessToken }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await Token.findOneAndDelete({ token: refreshToken, type: 'refresh' });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, 'Refresh token is missing');

    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const tokenDoc = await Token.findOne({
      token: incomingRefreshToken,
      type: 'refresh',
      isRevoked: false,
    });
    if (!tokenDoc) throw new ApiError(401, 'Refresh token has been revoked');

    const user = await User.findById(decoded._id);
    if (!user || !user.isActive) throw new ApiError(401, 'User not found or inactive');

    // Rotate refresh token
    await Token.findByIdAndDelete(tokenDoc._id);

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    await Token.create({
      user: user._id,
      token: newRefreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, 'Access token refreshed'));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond with success to prevent email enumeration
    const MESSAGE = 'If an account with that email exists, a password reset email has been sent.';

    if (!user) return res.status(200).json(new ApiResponse(200, null, MESSAGE));

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production, send email here
    console.log(`Password reset token (dev only): ${resetToken}`);

    return res.status(200).json(new ApiResponse(200, null, MESSAGE));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) throw new ApiError(400, 'Invalid or expired reset token');

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    // Revoke all refresh tokens
    await Token.deleteMany({ user: user._id, type: 'refresh' });

    return res.status(200).json(new ApiResponse(200, null, 'Password reset successful'));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price discountPercent');
    return res.status(200).json(new ApiResponse(200, user, 'User profile retrieved'));
  } catch (error) {
    next(error);
  }
};
