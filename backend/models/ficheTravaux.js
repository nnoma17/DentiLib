const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FicheTravaux = sequelize.define('FicheTravaux', {
  idWorkSheet: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numWorkSheet:      { type: DataTypes.BIGINT },
  status:            { type: DataTypes.ENUM('A valider','En attente','En cours','Termine') },
  date_creation:     { type: DataTypes.DATE },
  comment:           { type: DataTypes.TEXT },
  lastNamePatient:   { type: DataTypes.STRING },
  firstNamePatient:  { type: DataTypes.STRING },
  emailNamePatient:  { type: DataTypes.STRING },
  numSecuPatient:    { type: DataTypes.STRING },
  idDentist:         { type: DataTypes.INTEGER },
  idProthesiste:     { type: DataTypes.INTEGER }
}, {
  tableName: 'FicheTravaux',
  timestamps: false
});

module.exports = FicheTravaux;