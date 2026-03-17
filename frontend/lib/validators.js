import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().min(10, 'Valid phone number required'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  zipCode: z.string().min(4, 'Valid ZIP code required'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating required').max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20),
  description: z.string().max(200).optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  minOrderAmount: z.number().min(0).default(0),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().min(1).default(1),
  startDate: z.string(),
  endDate: z.string(),
});

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(20).max(5000),
  shortDescription: z.string().max(300).optional(),
  price: z.number().positive(),
  discountPercent: z.number().min(0).max(100).optional(),
  category: z.string().min(1, 'Category required'),
  brand: z.string().min(1, 'Brand required'),
  stock: z.number().int().min(0),
  sku: z.string().min(3),
  warranty: z.string().optional(),
  isFeatured: z.boolean().optional(),
});
