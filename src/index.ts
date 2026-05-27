import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { color } from 'console-log-colors';
import routes from './routes';
import { validateEnv } from './config/env';
import { corsOptions } from './config/cors';
import { syncModels } from './model';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
validateEnv();

const app: Application = express();
const port = process.env.APP_PORT;

app.use(helmet());
app.use(cors(corsOptions()));
app.use(express.json());

routes(app);

async function startServer(): Promise<void> {
  await syncModels();

  app.listen(port, () => {
    console.log(color.cyan(`Server running on port ${port} (${env} mode)`));
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
