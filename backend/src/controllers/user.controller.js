import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'wishlist',
      'name slug images price discountPercent averageRating'
    );
    if (!user) throw new ApiError(404, 'User not found');
    return res.status(200).json(new ApiResponse(200, user, 'Profile retrieved'));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    return res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'No image uploaded');

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'Aspar/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    });

    user.avatar = { url: result.url, publicId: result.publicId };
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user, 'Avatar updated'));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isCorrect = await user.comparePassword(currentPassword);
    if (!isCorrect) throw new ApiError(400, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { isDefault, ...addressData } = req.body;

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({ ...addressData, isDefault: isDefault || user.addresses.length === 0 });
    await user.save();

    return res.status(201).json(new ApiResponse(201, user.addresses, 'Address added'));
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) throw new ApiError(404, 'Address not found');

    const { isDefault, ...updates } = req.body;
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    Object.assign(address, { ...updates, isDefault: isDefault ?? address.isDefault });
    await user.save();

    return res.status(200).json(new ApiResponse(200, user.addresses, 'Address updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) throw new ApiError(404, 'Address not found');

    address.deleteOne();
    await user.save();

    return res.status(200).json(new ApiResponse(200, user.addresses, 'Address deleted'));
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.indexOf(productId);
    let action;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save({ validateBeforeSave: false });
    return res.status(200).json(
      new ApiResponse(200, { wishlist: user.wishlist, action }, `Product ${action} from wishlist`)
    );
  } catch (error) {
    next(error);
  }
};
