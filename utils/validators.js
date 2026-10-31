/**
 * Validations de données réutilisables côté serveur.
 *
 * Ces fonctions sont pures (aucune dependance a la base de donnees) :
 * elles sont donc directement testables unitairement (tests/unit).
 *
 * Regle generale : le client ne doit jamais etre considered comme fiable,
 * toutes les regles metier sont revalidees ici.
 */

// Format d'e-mail
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Numero de securite sociale
const NUM_SECU_REGEX = /^\d{1,15}$/;

//Mot de passe
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 72;

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;
const MAX_COMMENT_LENGTH = 2000;
const MAX_ACT_NAME_LENGTH = 150;

/**
 * Verifie qu'une valeur est une chaine non vide (espaces retires).
 * @param {*} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Verifie le format d'une adresse e-mail.
 * @param {*} value
 * @returns {boolean}
 */
function isValidEmail(value) {
  return (
    isNonEmptyString(value) &&
    value.length <= MAX_EMAIL_LENGTH &&
    EMAIL_REGEX.test(value.trim())
  );
}

/**
 * Verifie qu'un mot de passe respecte la politique de securite.
 * @param {*} value
 * @returns {boolean}
 */
function isValidPassword(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length >= PASSWORD_MIN_LENGTH &&
    value.length <= PASSWORD_MAX_LENGTH
  );
}

/**
 * Verifie qu'un numero de securite sociale ne contient que des chiffres.
 * @param {*} value
 * @returns {boolean}
 */
function isValidNumSecu(value) {
  return typeof value === "string" && NUM_SECU_REGEX.test(value.trim());
}

/**
 * Convertit une valeur en entier strictement positif, ou null si invalide.
 * @param {*} value
 * @returns {number|null}
 */
function toPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

/**
 * Normalise une chaine (trim + longueur maximale) avant stockage.
 * @param {*} value
 * @param {number} [maxLength]
 * @returns {string}
 */
function sanitizeText(value, maxLength = MAX_COMMENT_LENGTH) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/**
 * Verifie qu'un prix est un nombre fini positif ou nul.
 * @param {*} value
 * @returns {boolean}
 */
function isValidPrice(value) {
  if (value === null || value === undefined || value === "") return false;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
}

module.exports = {
  EMAIL_REGEX,
  NUM_SECU_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_COMMENT_LENGTH,
  MAX_ACT_NAME_LENGTH,
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isValidNumSecu,
  toPositiveInt,
  sanitizeText,
  isValidPrice
};
