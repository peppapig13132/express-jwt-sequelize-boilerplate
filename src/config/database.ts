import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || 'express_boilerplate';
const dbAdmin = process.env.DB_ADMIN || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';

const sequelize = new Sequelize(dbName, dbAdmin, dbPassword, {
  host: dbHost,
  dialect: 'postgres',
});

sequelize.authenticate().then(() => {
  console.log(`Database connected. DB_HOST: ${dbHost}, DB_NAME: ${dbName}`);
}).catch((error) => {
  console.log('Database connection failed', error);
});

export default sequelize;
