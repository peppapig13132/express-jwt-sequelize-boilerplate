import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import {
  createAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../src/utils/tokens';

describe('token utilities', () => {
  it('hashes refresh tokens consistently', () => {
    const token = 'sample-refresh-token';
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    expect(hashRefreshToken(token)).not.toBe(hashRefreshToken('other-token'));
  });

  it('generates unique refresh tokens', () => {
    const first = generateRefreshToken();
    const second = generateRefreshToken();

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(32);
  });

  it('creates access tokens with access type claim', () => {
    const token = createAccessToken({ id: 1, email: 'user@example.com' });
    const decoded = jwt.decode(token) as { type?: string; id?: number; email?: string };

    expect(decoded.type).toBe('access');
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('user@example.com');
  });
});
