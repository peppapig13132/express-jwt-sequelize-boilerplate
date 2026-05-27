const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/** Used when no user exists so login timing does not reveal account existence. */
export const DUMMY_PASSWORD_HASH =
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') {
    return null;
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized || !EMAIL_REGEX.test(normalized)) {
    return null;
  }
  return normalized;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return null;
  }
  return password;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export function parseAuthCredentials(body: unknown): AuthCredentials | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const { email, password } = body as Record<string, unknown>;
  const normalizedEmail = normalizeEmail(email);
  const validPassword = validatePassword(password);

  if (!normalizedEmail || !validPassword) {
    return null;
  }

  return { email: normalizedEmail, password: validPassword };
}
