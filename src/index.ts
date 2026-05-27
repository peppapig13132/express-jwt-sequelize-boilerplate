import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { color } from 'console-log-colors';
import routes from './routes';
import { validateEnv } from './config/env';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
validateEnv();

const app: Application = express();

const port = process.env.APP_PORT;

app.use(cors());
app.use(express.json());

routes(app);

app.listen(port, () => {
    console.log(color.cyan(`Server running on port ${port} (${env} mode)`));
});
