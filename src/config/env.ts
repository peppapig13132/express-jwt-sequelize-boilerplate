const MIN_SECRET_LENGTH = 32;

export function getJwtSecret(): string {
  const secret = process.env.SECRETKEY;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SECRETKEY must be set and at least ${MIN_SECRET_LENGTH} characters long`
    );
  }
  return secret;
}

export function validateEnv(): void {
  if (!process.env.APP_PORT) {
    throw new Error('APP_PORT must be set');
  }

  getJwtSecret();
}
