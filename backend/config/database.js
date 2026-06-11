const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'dentilib',
  'dentilib_user',
  'admin',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;