const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: "idUser"
  },

  lastName: DataTypes.STRING,
  firstName: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.ENUM('DENTISTE','PROTHESISTE','ADMIN'),
  siret: DataTypes.STRING,
  createdAt: DataTypes.DATE,

  associatedUser: {
    type: DataTypes.INTEGER,
    field: "associatedUser",
    allowNull: true
  }
}, {
  tableName: 'Utilisateur',
  timestamps: false
});

module.exports = Utilisateur;