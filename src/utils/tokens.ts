import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import RefreshToken from '../model/refreshToken.model';
import { getJwtSecret, getRefreshTokenDays } from '../config/env';

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';

export interface TokenUser {
  id: number;
  email: string;
}

export function createAccessToken(user: TokenUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: 'access',
    },
    getJwtSecret(),
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256',
    }
  );
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + getRefreshTokenDays());
  return expiresAt;
}

export async function issueTokenPair(user: TokenUser): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const refreshToken = generateRefreshToken();

  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
  });

  return {
    accessToken: createAccessToken(user),
    refreshToken,
  };
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  const tokenHash = hashRefreshToken(token);
  const [updatedCount] = await RefreshToken.update(
    { revokedAt: new Date() },
    {
      where: {
        tokenHash,
        revokedAt: null,
      },
    }
  );

  return updatedCount > 0;
}

export async function revokeAllUserRefreshTokens(userId: number): Promise<number> {
  const [updatedCount] = await RefreshToken.update(
    { revokedAt: new Date() },
    {
      where: {
        userId,
        revokedAt: null,
      },
    }
  );

  return updatedCount;
}
