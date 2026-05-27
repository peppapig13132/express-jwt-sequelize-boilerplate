import { Request, Response, Application } from 'express';
import authRouter from './auth.route';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../interfaces/interfaces';
import path from 'path';

export default (app: Application) => {
  app.get('/', (req: Request, res: Response) => {
    res.send('Express.js server is running!');
  });

  app.use('/api/auth', authRouter);

  app.get('/api/protected', authenticate, (req: AuthRequest, res: Response) => {
    res.json({
      ok: true,
      msg: 'This is a protected route.',
      user: req.user,
    });
  });

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', '..', 'static', 'index.html'));
  });
};
