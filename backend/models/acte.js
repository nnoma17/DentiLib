const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Acte = sequelize.define('Acte', {
  idProcedure: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  description: DataTypes.TEXT
}, {
  tableName: 'Acte',
  timestamps: false
});

module.exports = Acte;