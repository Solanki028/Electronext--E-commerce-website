import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'Something went wrong';
}

export function isValidMongoId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function generateSKU(name, brand) {
  const nameCode = name.slice(0, 3).toUpperCase();
  const brandCode = brand.slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${nameCode}-${brandCode}-${random}`;
}
