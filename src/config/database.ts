import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const isTest = env === 'test';

const sequelize = isTest
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'express_boilerplate',
      process.env.DB_ADMIN || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
      }
    );

if (!isTest) {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'express_boilerplate';

  sequelize.authenticate().then(() => {
    console.log(`Database connected. DB_HOST: ${dbHost}, DB_NAME: ${dbName}`);
  }).catch((error) => {
    console.log('Database connection failed', error);
  });
}

export default sequelize;
