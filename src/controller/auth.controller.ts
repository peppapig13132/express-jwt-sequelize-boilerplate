import { Response, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { AuthRequest } from '../interfaces/interfaces';
import User from '../model/user.model';
import RefreshToken from '../model/refreshToken.model';
import { DUMMY_PASSWORD_HASH } from '../utils/auth';
import {
  hashRefreshToken,
  issueTokenPair,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
} from '../utils/tokens';
import {
  AuthCredentials,
  RefreshTokenBody,
} from '../schemas/auth.schema';

const SALT_ROUNDS = 10;
const INVALID_CREDENTIALS_MSG = 'Invalid email or password';
const INVALID_REFRESH_TOKEN_MSG = 'Invalid or expired refresh token';

export const signup: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body as AuthCredentials;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    email,
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

export const login: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body as AuthCredentials;

  const user = await User.findOne({
    where: { email },
  });

  const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
  const isValidPassword = await bcrypt.compare(password, passwordHash);

  if (!user || !isValidPassword) {
    return res.status(401).json({
      ok: false,
      msg: INVALID_CREDENTIALS_MSG,
    });
  }

  const tokens = await issueTokenPair({
    id: user.id,
    email: user.email,
  });

  res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
    },
    ...tokens,
  });
});

export const refresh: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenBody;
  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  const user = storedToken ? await User.findByPk(storedToken.userId) : null;

  if (!storedToken || !user) {
    return res.status(401).json({
      ok: false,
      msg: INVALID_REFRESH_TOKEN_MSG,
    });
  }

  await storedToken.update({ revokedAt: new Date() });

  const tokens = await issueTokenPair({
    id: user.id,
    email: user.email,
  });

  res.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
    },
    ...tokens,
  });
});

export const logout: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenBody;
  await revokeRefreshToken(refreshToken);

  res.json({
    ok: true,
    msg: 'Logged out successfully',
  });
});

export const logoutAll: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const revokedCount = await revokeAllUserRefreshTokens(req.user!.id);

  res.json({
    ok: true,
    msg: 'All sessions revoked',
    revokedCount,
  });
});
