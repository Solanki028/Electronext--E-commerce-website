import Review from '../models/Review.model.js';
import Order from '../models/Order.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filter = { product: req.params.productId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(200, { reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } }, 'Reviews retrieved')
    );
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, orderId } = req.body;

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) throw new ApiError(409, 'You have already reviewed this product');

    // Verify purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
        status: 'delivered',
        'items.product': productId,
      });
      if (order) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId || null,
      rating,
      title: title || '',
      comment,
      isVerifiedPurchase,
    });

    await review.populate('user', 'name avatar');

    return res.status(201).json(new ApiResponse(201, review, 'Review submitted'));
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) throw new ApiError(404, 'Review not found');

    const { rating, title, comment } = req.body;
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    await review.save();

    return res.status(200).json(new ApiResponse(200, review, 'Review updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) throw new ApiError(404, 'Review not found or unauthorized');

    await Review.findOneAndDelete({ _id: req.params.reviewId });

    return res.status(200).json(new ApiResponse(200, null, 'Review deleted'));
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) throw new ApiError(404, 'Review not found');

    const userId = req.user._id;
    const hasMarked = review.helpful.includes(userId);

    if (hasMarked) {
      review.helpful.pull(userId);
    } else {
      review.helpful.push(userId);
    }
    await review.save();

    return res.status(200).json(new ApiResponse(200, { helpfulCount: review.helpful.length }, 'Updated'));
  } catch (error) {
    next(error);
  }
};
