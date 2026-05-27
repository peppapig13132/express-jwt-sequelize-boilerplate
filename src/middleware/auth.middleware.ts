import { Request, Response, NextFunction, RequestHandler } from 'express';
import User from '../model/user.model';
import { AuthRequest } from '../interfaces/interfaces';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getJwtSecret } from '../config/env';
import { normalizeEmail } from '../utils/auth';

export const checkDuplicatedEmail: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const email = normalizeEmail(req.body?.email);

  if (!email) {
    return res.status(400).json({
      ok: false,
      msg: 'Valid email and password (min 8 characters) are required',
    });
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    return res.status(409).json({
      ok: false,
      msg: 'Email already taken',
    });
  }

  req.body.email = email;
  next();
};

export const authenticate: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      msg: 'Authorization token required',
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: 'Authorization token required',
    });
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as JwtPayload;
  } catch {
    return res.status(401).json({
      ok: false,
      msg: 'Invalid or expired token',
    });
  }

  const userId = decoded.id;
  const email = decoded.email;

  if (typeof userId !== 'number' || typeof email !== 'string') {
    return res.status(401).json({
      ok: false,
      msg: 'Invalid or expired token',
    });
  }

  const user = await User.findOne({
    where: {
      id: userId,
      email,
    },
  });

  if (!user) {
    return res.status(401).json({
      ok: false,
      msg: 'Invalid or expired token',
    });
  }

  req.user = {
    id: user.id,
    email: user.email,
  };

  next();
};
