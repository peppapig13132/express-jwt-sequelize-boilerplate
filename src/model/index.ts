import sequelize from '../config/database';
import User from './user.model';
import RefreshToken from './refreshToken.model';

RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });

export { User, RefreshToken };

export async function syncModels(): Promise<void> {
  const syncMode = process.env.DB_SYNC;

  if (!syncMode || syncMode === 'false') {
    return;
  }

  try {
    if (syncMode === 'alter') {
      await sequelize.sync({ alter: true });
      console.log('Models altered to match schema.');
      return;
    }

    if (syncMode === 'true') {
      await sequelize.sync();
      console.log('Models synchronized with database.');
      return;
    }

    console.warn(`Unknown DB_SYNC value "${syncMode}". Expected true, alter, or false.`);
  } catch (error) {
    console.error('Model synchronization failed:', error);
  }
}

export default sequelize;
