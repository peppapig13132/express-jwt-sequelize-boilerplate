import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';

type RequestSource = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: RequestSource = 'body'): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const msg = result.error.issues.map((issue) => issue.message).join('; ');
      return res.status(400).json({ ok: false, msg });
    }

    req[source] = result.data;
    next();
  };
