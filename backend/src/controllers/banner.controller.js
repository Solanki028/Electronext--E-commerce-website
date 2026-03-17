import Banner from '../models/Banner.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

export const getActiveBanners = async (req, res, next) => {
  try {
    const { position } = req.query;
    const filter = { isActive: true };
    if (position) filter.position = position;

    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean({ virtuals: true });
    const liveBanners = banners.filter((b) => {
      const now = new Date();
      if (b.startDate && now < new Date(b.startDate)) return false;
      if (b.endDate && now > new Date(b.endDate)) return false;
      return true;
    });

    return res.status(200).json(new ApiResponse(200, liveBanners, 'Banners retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ sortOrder: 1 });
    return res.status(200).json(new ApiResponse(200, banners, 'All banners retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'Banner image is required');

    const result = await uploadToCloudinary(req.file.buffer, { folder: 'electronest/banners' });

    const banner = await Banner.create({
      ...req.body,
      image: { url: result.url, publicId: result.publicId, alt: req.body.title },
    });

    return res.status(201).json(new ApiResponse(201, banner, 'Banner created'));
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) throw new ApiError(404, 'Banner not found');

    const updates = { ...req.body };

    if (req.file) {
      if (banner.image?.publicId) await deleteFromCloudinary(banner.image.publicId);
      const result = await uploadToCloudinary(req.file.buffer, { folder: 'electronest/banners' });
      updates.image = { url: result.url, publicId: result.publicId, alt: req.body.title || banner.title };
    }

    const updated = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
    return res.status(200).json(new ApiResponse(200, updated, 'Banner updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) throw new ApiError(404, 'Banner not found');

    if (banner.image?.publicId) await deleteFromCloudinary(banner.image.publicId);
    await Banner.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, null, 'Banner deleted'));
  } catch (error) {
    next(error);
  }
};
