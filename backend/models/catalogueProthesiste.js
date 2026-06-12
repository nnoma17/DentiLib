const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CatalogueProthesiste = sequelize.define('CatalogueProthesiste', {
  idProthesiste: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },

  idProcedure: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },

  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  }
}, {
  tableName: 'CatalogueProthesiste',
  timestamps: false
});

module.exports = CatalogueProthesiste;