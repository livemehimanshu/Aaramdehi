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
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().min(3)
});

export const reviewSchema = z.object({
  userName: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1)
});
