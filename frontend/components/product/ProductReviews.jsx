'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Loader2, Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StarRating from '@/components/shared/StarRating';
import Pagination from '@/components/shared/Pagination';
import { selectIsAuthenticated, selectCurrentUser } from '@/store/slices/authSlice';
import { productService } from '@/services/productService';
import { formatRelativeTime } from '@/lib/formatters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STAR_LABELS = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a review'); return; }
    setSubmitting(true);
    try {
      await productService.createReview(productId, { rating, title, comment });
      toast.success('Review submitted!');
      onSuccess?.();
      setRating(0); setTitle(''); setComment('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-5 space-y-4">
      <h4 className="font-semibold text-slate-900">Write a Review</h4>

      {/* Star picker */}
      <div>
        <Label>Your Rating *</Label>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-7 h-7 transition-colors',
                  star <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                )}
              />
            </button>
          ))}
          {(hovered || rating) > 0 && (
            <span className="ml-2 text-sm text-slate-500">{STAR_LABELS[(hovered || rating) - 1]}</span>
          )}
        </div>
      </div>

      <div>
        <Label>Title</Label>
        <Input className="mt-1" value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your review" />
      </div>

      <div>
        <Label>Review *</Label>
        <Textarea className="mt-1" rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience with this product..." />
      </div>

      <Button type="submit" disabled={submitting} className="gap-2">
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

function RatingSummary({ averageRating, reviewCount, ratingBreakdown }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-6">
      <div className="flex flex-col items-center justify-center bg-primary-50 rounded-xl p-5 min-w-28">
        <p className="text-5xl font-black text-primary-700">{averageRating?.toFixed(1)}</p>
        <StarRating rating={averageRating} size="md" className="mt-2" />
        <p className="text-xs text-slate-400 mt-2">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
      </div>

      {ratingBreakdown?.length > 0 && (
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const entry = ratingBreakdown.find(r => r._id === star);
            const count = entry?.count || 0;
            const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-5 text-right">{star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-6">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductReviews({ productId, averageRating, reviewCount }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [reviews, setReviews] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await productService.getProductReviews(productId, { page, limit: 5 });
      setReviews(res.data.reviews);
      setRatingBreakdown(res.data.ratingBreakdown || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [productId, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const hasReviewed = reviews.some(r => r.user?._id === user?._id);

  return (
    <div className="space-y-6">
      {/* Summary */}
      {reviewCount > 0 && (
        <RatingSummary averageRating={averageRating} reviewCount={reviewCount} ratingBreakdown={ratingBreakdown} />
      )}

      {/* Leave a review */}
      {isAuthenticated && !hasReviewed && (
        <ReviewForm productId={productId} onSuccess={() => { setPage(1); fetchReviews(); }} />
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : reviews.length === 0 ? (
        <p className="text-slate-400 text-sm">No reviews yet. {isAuthenticated ? 'Be the first to share your experience!' : 'Sign in to leave a review.'}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                  {review.user?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-slate-900">{review.user?.name}</p>
                    <div className="flex items-center gap-2">
                      {review.isVerifiedPurchase && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">✓ Verified Purchase</Badge>
                      )}
                      <span className="text-xs text-slate-400">{formatRelativeTime(review.createdAt)}</span>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="sm" className="mt-1" />
                  {review.title && <p className="text-sm font-semibold text-slate-900 mt-1.5">{review.title}</p>}
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{review.comment}</p>

                  {review.helpfulCount > 0 && (
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {review.helpfulCount} found this helpful
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-2" />
          )}
        </div>
      )}
    </div>
  );
}
