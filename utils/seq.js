import { Sequelize, DataTypes } from 'sequelize';
import { DATABASE } from '../config';

const sequelize = new Sequelize(
  DATABASE.database,
  DATABASE.username,
  DATABASE.password,
  {
    host: DATABASE.host,
    port: DATABASE.port,
    dialect: DATABASE.type,
    pool: DATABASE.pool,
    define: {
      freezeTableName: true,
      underscored: true,
      createdAt: false,
      updatedAt: false
    }
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default sequelize;

/** 字符串 */
export const STRING = DataTypes.STRING;
/** 小数 */
export const DECIMAL = DataTypes.DECIMAL;
/** 文本 */
export const TEXT = DataTypes.TEXT;
/** 整数 */
export const INTEGER = DataTypes.INTEGER;
/** 布尔值 */
export const BOOLEAN = DataTypes.BOOLEAN;
/** 日期 */
export const DATE = DataTypes.DATE;
