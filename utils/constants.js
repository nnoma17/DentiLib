const WORKSHEET_STATUS = {
  A_VALIDER: "A valider",
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TERMINE: "Termine"
};

/**
 * Roles applicatifs (valeurs de la colonne `role` de la table Utilisateur).
 * Ce sont les memes valeurs que l'enum SQL, toute evolution doit etre
 * reportee dans sql/01_schema.sql.
 */
const USER_ROLES = {
  DENTISTE: "DENTISTE",
  PROTHESISTE: "PROTHESISTE",
  ADMIN: "ADMIN"
};

module.exports = {
  WORKSHEET_STATUS,
  USER_ROLES
};