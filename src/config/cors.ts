import { CorsOptions } from 'cors';
import { getCorsOrigins } from './env';

export function corsOptions(): CorsOptions {
  const origins = getCorsOrigins();

  return {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
