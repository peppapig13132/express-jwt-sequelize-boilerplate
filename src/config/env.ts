const MIN_SECRET_LENGTH = 32;
const DEFAULT_REFRESH_TOKEN_DAYS = 7;

export function getJwtSecret(): string {
  const secret = process.env.SECRETKEY;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SECRETKEY must be set and at least ${MIN_SECRET_LENGTH} characters long`
    );
  }
  return secret;
}

export function getRefreshTokenDays(): number {
  const days = Number(process.env.REFRESH_TOKEN_DAYS ?? DEFAULT_REFRESH_TOKEN_DAYS);
  if (!Number.isFinite(days) || days < 1) {
    throw new Error('REFRESH_TOKEN_DAYS must be a positive number');
  }
  return days;
}

export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;

  if (raw) {
    return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
  }

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return ['http://localhost:3000', 'http://localhost:5173'];
  }

  throw new Error('CORS_ORIGINS must be set in production');
}

export function validateEnv(): void {
  if (!process.env.APP_PORT) {
    throw new Error('APP_PORT must be set');
  }

  getJwtSecret();
  getRefreshTokenDays();
  getCorsOrigins();
}
