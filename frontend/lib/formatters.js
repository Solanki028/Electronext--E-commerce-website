import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format currency in INR
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, pattern);
  } catch {
    return '';
  }
};

/**
 * Format relative time (e.g. "2 days ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, {
      addSuffix: true,
    });
  } catch {
    return '';
  }
};

/**
 * Format order number for display
 */
export const formatOrderNumber = (orderNumber) => {
  return orderNumber || 'N/A';
};

/**
 * Calculate discount percentage to show
 */
export const formatDiscount = (originalPrice, discountPercent) => {
  if (!discountPercent) return null;
  return `${discountPercent}% OFF`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Shorten large numbers
 */
export const formatCount = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};
