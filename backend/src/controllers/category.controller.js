import Category from '../models/Category.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import slugify from '../utils/slugify.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

export const getCategories = async (req, res, next) => {
  try {
    const { parent, includeInactive } = req.query;
    const filter = {};
    if (!includeInactive) filter.isActive = true;
    if (parent === 'null') filter.parent = null;
    else if (parent) filter.parent = parent;

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .lean({ virtuals: true });

    return res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
      .populate('parent', 'name slug');
    if (!category) throw new ApiError(404, 'Category not found');
    return res.status(200).json(new ApiResponse(200, category, 'Category retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name slug');
    if (!category) throw new ApiError(404, 'Category not found');
    return res.status(200).json(new ApiResponse(200, category, 'Category retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, parent, specificationTemplate, sortOrder } = req.body;

    let image = { url: '', publicId: '' };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, { folder: 'Aspar/categories' });
      image = { url: result.url, publicId: result.publicId };
    }

    const category = await Category.create({
      name,
      slug: slugify(name),
      description: description || '',
      parent: parent || null,
      image,
      specificationTemplate: specificationTemplate ? JSON.parse(specificationTemplate) : [],
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    });

    return res.status(201).json(new ApiResponse(201, category, 'Category created'));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');

    const updates = { ...req.body };
    if (updates.name) updates.slug = slugify(updates.name);
    if (updates.specificationTemplate) updates.specificationTemplate = JSON.parse(updates.specificationTemplate);
    if (updates.sortOrder) updates.sortOrder = Number(updates.sortOrder);

    if (req.file) {
      if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
      const result = await uploadToCloudinary(req.file.buffer, { folder: 'Aspar/categories' });
      updates.image = { url: result.url, publicId: result.publicId };
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    return res.status(200).json(new ApiResponse(200, updated, 'Category updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');

    if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
  } catch (error) {
    next(error);
  }
};
