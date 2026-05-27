import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './model';
import routes from './routes';
import { corsOptions } from './config/cors';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions()));
  app.use(express.json());
  routes(app);

  return app;
}
