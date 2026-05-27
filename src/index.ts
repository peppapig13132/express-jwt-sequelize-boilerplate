import dotenv from 'dotenv';
import { color } from 'console-log-colors';
import { createApp } from './app';
import { validateEnv } from './config/env';
import { syncModels } from './model';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
validateEnv();

const port = process.env.APP_PORT;

async function startServer(): Promise<void> {
  await syncModels();

  const app = createApp();
  app.listen(port, () => {
    console.log(color.cyan(`Server running on port ${port} (${env} mode)`));
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
