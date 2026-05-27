import { Request, Response, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../model/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/env';
import {
  DUMMY_PASSWORD_HASH,
  parseAuthCredentials,
} from '../utils/auth';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '24h';
const INVALID_CREDENTIALS_MSG = 'Invalid email or password';

export const signup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const credentials = parseAuthCredentials(req.body);

  if (!credentials) {
    return res.status(400).json({
      ok: false,
      msg: 'Valid email and password (min 8 characters) are required',
    });
  }

  const passwordHash = await bcrypt.hash(credentials.password, SALT_ROUNDS);

  const user = await User.create({
    email: credentials.email,
    password: passwordHash,
  });

  res.status(201).json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const credentials = parseAuthCredentials(req.body);

  if (!credentials) {
    return res.status(400).json({
      ok: false,
      msg: 'Valid email and password (min 8 characters) are required',
    });
  }

  const user = await User.findOne({
    where: {
      email: credentials.email,
    },
  });

  const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
  const isValidPassword = await bcrypt.compare(credentials.password, passwordHash);

  if (!user || !isValidPassword) {
    return res.status(401).json({
      ok: false,
      msg: INVALID_CREDENTIALS_MSG,
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: TOKEN_EXPIRY,
      algorithm: 'HS256',
    }
  );

  res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
    },
    token,
  });
});
