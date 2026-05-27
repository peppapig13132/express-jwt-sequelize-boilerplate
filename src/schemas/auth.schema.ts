import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Valid email is required'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: 'Refresh token is required' })
    .min(1, 'Refresh token is required'),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
