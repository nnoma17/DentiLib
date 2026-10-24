/**
 * Regles de gestion metier du workflow des fiches de travaux.
 *
 * Fonctions pures (aucune dependance a la base de donnees) : elles encodent
 * le cahier des charges et sont testables unitairement (tests/unit).
 *
 * Circuit nominal d'une fiche :
 *   A valider  (creation par le dentiste)
 *   -> En attente (le dentiste valide et envoie la fiche a l'atelier)
 *   -> En cours  (le prothesiste traite la fiche)
 *   -> Termine   (le prothesiste cloture la fiche)
 */
const { USER_ROLES, WORKSHEET_STATUS } = require("./constants");

// Statut vers lequel chaque role a le droit de faire passer une fiche.
const STATUS_TRANSITIONS = {
  [USER_ROLES.DENTISTE]: [
    WORKSHEET_STATUS.A_VALIDER,
    WORKSHEET_STATUS.EN_ATTENTE
  ],
  [USER_ROLES.PROTHESISTE]: [
    WORKSHEET_STATUS.EN_ATTENTE,
    WORKSHEET_STATUS.EN_COURS,
    WORKSHEET_STATUS.TERMINE
  ],
  [USER_ROLES.ADMIN]: Object.values(WORKSHEET_STATUS)
};

// Le dentiste n'agit sur une fiche que tant qu'elle n'a pas ete envoyee a l'atelier.
const DENTISTE_SOURCE_STATUS = WORKSHEET_STATUS.A_VALIDER;

// Statuts pour lesquels le dentiste est autorise a supprimer une fiche.
const DENTISTE_DELETABLE_STATUSES = [
  WORKSHEET_STATUS.A_VALIDER,
  WORKSHEET_STATUS.TERMINE
];

/**
 * Le role a-t-il le droit de passer la fiche au statut demande ?
 * @param {string} role
 * @param {string} status
 * @returns {boolean}
 */
function canSetStatus(role, status) {
  const allowed = STATUS_TRANSITIONS[role];
  return Array.isArray(allowed) && allowed.includes(status);
}

/**
 * Le role peut-il intervenir sur une fiche dans cet etat ?
 * @param {string} role
 * @param {string} currentStatus
 * @returns {boolean}
 */
function canActOnStatus(role, currentStatus) {
  if (role === USER_ROLES.ADMIN) return true;
  if (role === USER_ROLES.DENTISTE) return currentStatus === DENTISTE_SOURCE_STATUS;
  if (role === USER_ROLES.PROTHESISTE) {
    // Le prothesiste n'intervient que sur les fiches qui lui ont ete transmises.
    return currentStatus !== WORKSHEET_STATUS.A_VALIDER;
  }
  return false;
}

/**
 * Le role a-t-il le droit de supprimer la fiche ?
 * @param {string} role
 * @param {string} currentStatus
 * @returns {boolean}
 */
function canDeleteWorksheet(role, currentStatus) {
  if (role === USER_ROLES.ADMIN) return true;
  if (role === USER_ROLES.DENTISTE) {
    return DENTISTE_DELETABLE_STATUSES.includes(currentStatus);
  }
  return false;
}

/**
 * Le role est-il autorise a consulter des fiches de travaux ?
 * @param {string} role
 * @returns {boolean}
 */
function canViewWorksheet(role) {
  return Object.values(USER_ROLES).includes(role);
}

module.exports = {
  STATUS_TRANSITIONS,
  DENTISTE_SOURCE_STATUS,
  DENTISTE_DELETABLE_STATUSES,
  canSetStatus,
  canActOnStatus,
  canDeleteWorksheet,
  canViewWorksheet
};
