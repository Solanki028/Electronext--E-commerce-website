import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import slugify from '../utils/slugify.js';
import { uploadManyToCloudinary, deleteFromCloudinary, deleteManyFromCloudinary } from '../services/cloudinary.service.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      search,
      isFeatured,
      inStock,
      minDiscount,
    } = req.query;

    const filter = { isActive: true };
    if (minDiscount) filter.discountPercent = { $gte: Number(minDiscount) };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (brand) filter.brand = { $regex: new RegExp(brand, 'i') };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (rating) filter.averageRating = { $gte: Number(rating) };
    if (isFeatured === 'true') filter.isFeatured = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    res.setHeader('X-Total-Count', total);

    return res.status(200).json(
      new ApiResponse(200, {
        products,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      }, 'Products retrieved')
    );
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug specificationTemplate')
      .lean({ virtuals: true });

    if (!product) throw new ApiError(404, 'Product not found');

    return res.status(200).json(new ApiResponse(200, product, 'Product retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug specificationTemplate')
      .lean({ virtuals: true });

    if (!product) throw new ApiError(404, 'Product not found');

    return res.status(200).json(new ApiResponse(200, product, 'Product retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      discountPercent,
      category,
      brand,
      stock,
      sku,
      specifications,
      variants,
      tags,
      isFeatured,
      warranty,
      weight,
    } = req.body;

    // Validate category
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) throw new ApiError(404, 'Category not found');

    // Check duplicate SKU
    const existing = await Product.findOne({ sku });
    if (existing) throw new ApiError(409, 'SKU already exists');

    // Upload images
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploaded = await uploadManyToCloudinary(
        req.files.map((f) => f.buffer),
        { folder: 'Aspar/products' }
      );
      images = uploaded.map((r, i) => ({
        url: r.url,
        publicId: r.publicId,
        alt: `${name} - image ${i + 1}`,
      }));
    }

    const product = await Product.create({
      name,
      slug: slugify(name),
      description,
      shortDescription: shortDescription || '',
      price: Number(price),
      discountPercent: Number(discountPercent) || 0,
      category,
      brand,
      images,
      stock: Number(stock),
      sku,
      specifications: specifications ? JSON.parse(specifications) : [],
      variants: variants ? JSON.parse(variants) : [],
      tags: tags ? JSON.parse(tags) : [],
      isFeatured: isFeatured === 'true' || isFeatured === true,
      warranty: warranty || '',
      weight: weight ? Number(weight) : undefined,
    });

    return res.status(201).json(new ApiResponse(201, product, 'Product created'));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');

    const updates = { ...req.body };

    // Parse JSON fields
    if (updates.specifications) updates.specifications = JSON.parse(updates.specifications);
    if (updates.variants) updates.variants = JSON.parse(updates.variants);
    if (updates.tags) updates.tags = JSON.parse(updates.tags);
    if (updates.name) updates.slug = slugify(updates.name);
    if (updates.price) updates.price = Number(updates.price);
    if (updates.discountPercent) updates.discountPercent = Number(updates.discountPercent);
    if (updates.stock) updates.stock = Number(updates.stock);

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      const uploaded = await uploadManyToCloudinary(
        req.files.map((f) => f.buffer),
        { folder: 'Aspar/products' }
      );
      const newImages = uploaded.map((r, i) => ({
        url: r.url,
        publicId: r.publicId,
        alt: `${product.name} - image ${i + 1}`,
      }));
      updates.images = [...(product.images || []), ...newImages];
    }

    // Delete images if requested
    if (updates.deleteImages) {
      const toDelete = JSON.parse(updates.deleteImages);
      await deleteManyFromCloudinary(toDelete);
      updates.images = (updates.images || product.images).filter(
        (img) => !toDelete.includes(img.publicId)
      );
      delete updates.deleteImages;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    return res.status(200).json(new ApiResponse(200, updatedProduct, 'Product updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');

    // Delete images from Cloudinary
    await deleteManyFromCloudinary(product.images.map((img) => img.publicId));

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, null, 'Product deleted'));
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8)
      .lean({ virtuals: true });

    return res.status(200).json(new ApiResponse(200, products, 'Featured products retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found');

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(6)
      .lean({ virtuals: true });

    return res.status(200).json(new ApiResponse(200, related, 'Related products retrieved'));
  } catch (error) {
    next(error);
  }
};
