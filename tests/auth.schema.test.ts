import { describe, expect, it } from 'vitest';
import { authCredentialsSchema, refreshTokenSchema } from '../src/schemas/auth.schema';

describe('authCredentialsSchema', () => {
  it('accepts valid credentials and normalizes email', () => {
    const result = authCredentialsSchema.safeParse({
      email: ' User@Example.COM ',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.password).toBe('password123');
    }
  });

  it('rejects invalid email', () => {
    const result = authCredentialsSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(result.success).toBe(false);
  });

  it('rejects short passwords', () => {
    const result = authCredentialsSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });
});

describe('refreshTokenSchema', () => {
  it('accepts a non-empty refresh token', () => {
    const result = refreshTokenSchema.safeParse({
      refreshToken: 'abc123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty refresh token', () => {
    const result = refreshTokenSchema.safeParse({
      refreshToken: '',
    });

    expect(result.success).toBe(false);
  });
});
