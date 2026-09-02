import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match'
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6),
  confirmNewPassword: z.string().min(6)
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  address: z.string().min(1),
  city: z.string().trim().min(1, 'City is required'),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
  email: z.string().email(),
  state: z.string().trim().min(1)
});

export const reviewSchema = z.object({
  userName: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1)
});
