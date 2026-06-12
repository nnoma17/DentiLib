const sequelize = require('../config/database');

const Utilisateur = require('./utilisateur');
const Acte = require('./acte');
const FicheTravaux = require('./ficheTravaux');
const Log = require('./log');
const FicheTravauxActe = require('./ficheTravauxActe');
const CatalogueProthesiste = require('./catalogueProthesiste');

Utilisateur.hasMany(FicheTravaux, { foreignKey: 'idDentist' });
FicheTravaux.belongsTo(Utilisateur, { foreignKey: 'idDentist' });

Utilisateur.hasMany(Log, { foreignKey: 'user_id' });
Log.belongsTo(Utilisateur, { foreignKey: 'user_id' });

FicheTravaux.belongsToMany(Acte, {
  through: FicheTravauxActe,
  foreignKey: 'idWorkSheet',
  otherKey: 'idProcedure'
});

Acte.belongsToMany(FicheTravaux, {
  through: FicheTravauxActe,
  foreignKey: 'idProcedure',
  otherKey: 'idWorkSheet'
});

Utilisateur.belongsTo(Utilisateur, {
  as: 'Dentiste',
  foreignKey: 'associatedUser'
});

Utilisateur.hasMany(Utilisateur, {
  as: 'Prothesistes',
  foreignKey: 'associatedUser'
});

CatalogueProthesiste.belongsTo(Acte, {
  foreignKey: "idProcedure"
});

module.exports = {
  sequelize,
  Utilisateur,
  Acte,
  FicheTravaux,
  Log,
  FicheTravauxActe,
  CatalogueProthesiste
};