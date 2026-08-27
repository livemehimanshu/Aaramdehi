import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});

export const signupSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
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
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  postalCode: z.string().trim().min(3, 'Pincode must be at least 3 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.string().email('Enter a valid email address'),
  state: z.string().trim().min(1, 'State is required')
});

export const reviewSchema = z.object({
  userName: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1)
});
