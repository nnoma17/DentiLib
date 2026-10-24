/**
 * Controle d'acces aux ressources metier (fiche de travaux).
 *
 * Objectif : "ruptures de controle d'acces" (OWASP A05).
 * Chaque requete est filtree par le role ET par la propriete de la ressource :
 * un utilisateur ne peut jamais lire ou modifier la fiche d'un autre
 * professionnel, meme s'il connait l'identifiant.
 */
const { Op } = require("sequelize");
const { FicheTravaux } = require("../models");
const { USER_ROLES, WORKSHEET_STATUS } = require("../../utils/constants");
const { toPositiveInt } = require("../../utils/validators");

/**
 * Construit la clause WHERE limitant les fiches accessibles a l'utilisateur.
 *
 * - DENTISTE    : uniquement les fiches qu'il a creees.
 * - PROTHESISTE : uniquement les fiches qui lui sont confiees et qui ont ete
 *                 validees par le dentiste (statut different de "A valider").
 * - ADMIN       : acces a l'ensemble des fiches (back-office).
 *
 * @param {{id: number, role: string}} user
 * @returns {object} clause WHERE
 */
function buildWorksheetScope(user) {
  // Defense en profondeur : sans role reconnu, aucune fiche n'est accessible.
  if (!user || !user.id) return { idWorkSheet: -1 };

  if (user.role === USER_ROLES.DENTISTE) {
    return { idDentist: user.id };
  }

  if (user.role === USER_ROLES.PROTHESISTE) {
    return {
      idProthesiste: user.id,
      status: { [Op.ne]: WORKSHEET_STATUS.A_VALIDER }
    };
  }

  if (user.role === USER_ROLES.ADMIN) {
    return {};
  }

  // Role inconnu ou absent : on n'accorde l'accede a aucune ressource.
  return { idWorkSheet: -1 };
}

/**
 * Recupere une fiche de travaux si et seulement si l'utilisateur y a droit.
 * @param {{id: number, role: string}} user
 * @param {number|string} worksheetId
 * @param {object} [options] options Sequelize (include, attributes...)
 * @returns {Promise<object|null>} la fiche ou null
 */
async function findAccessibleWorksheet(user, worksheetId, options = {}) {
  const id = toPositiveInt(worksheetId);
  if (!id) return null;

  return FicheTravaux.findOne({
    ...options,
    where: { idWorkSheet: id, ...buildWorksheetScope(user) }
  });
}

module.exports = { buildWorksheetScope, findAccessibleWorksheet };
