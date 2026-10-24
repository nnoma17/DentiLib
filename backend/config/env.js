/**
 * Configuration centralisee et validee de l'environnement.
 *
 * Objectif : "Integrer les exigences de securite des la configuration initiale"
 * - les secrets ne sont jamais codees en dur, ils proviennent uniquement du .env ;
 * - le serveur refuse de demarrer si une variable critique est absente ou faible ;
 * - le .env est ignore par Git (voir .gitignore) et .env.example documente
 *   les variables attendues.
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Variables indispensables : le serveur ne demarre pas sans elles.
const REQUIRED_VARS = [
  { name: "JWT_SECRET", minLength: 16, label: "Cle de signature des jetons JWT" },
  { name: "DB_HOST", label: "Hote de la base de donnees" },
  { name: "DB_PORT", label: "Port de la base de donnees" },
  { name: "DB_NAME", label: "Nom de la base de donnees" },
  { name: "DB_USER", label: "Utilisateur de la base de donnees" },
  { name: "DB_PASSWORD", label: "Mot de passe de la base de donnees" }
];

// Variables facultatives (notifications par e-mail).
const OPTIONAL_VARS = ["MAIL_USER", "MAIL_PASSWORD"];

/**
 * Verifie que toutes les variables d'environnement critiques sont presentes
 * et exploitables.
 * @throws {Error} si la configuration est incomplete ou invalide.
 */
function validateEnvironment() {
  const errors = [];

  for (const variable of REQUIRED_VARS) {
    const value = process.env[variable.name];

    if (value === undefined || value === null || String(value).trim() === "") {
      errors.push(`${variable.name} (${variable.label}) est manquante ou vide`);
      continue;
    }

    if (variable.minLength && String(value).length < variable.minLength) {
      errors.push(
        `${variable.name} doit contenir au moins ${variable.minLength} caracteres ` +
        `(generation : node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")`
      );
    }
  }

  if (process.env.DB_PORT) {
    const port = Number(process.env.DB_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push("DB_PORT doit etre un numero de port valide (1-65535)");
    }
  }

  if (errors.length > 0) {
    throw new Error(
      "[CONFIG] Configuration d'environnement invalide :\n" +
        errors.map((message) => `  - ${message}`).join("\n")
    );
  }
}

/**
 * Retourne la configuration applicative, apres validation.
 * @returns {object}
 */
function getConfig() {
  validateEnvironment();

  return {
    port: Number(process.env.PORT) || 3000,
    isProduction: process.env.NODE_ENV === "production",
    jwtSecret: process.env.JWT_SECRET,
    database: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    mail: {
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD,
      enabled: Boolean(process.env.MAIL_USER && process.env.MAIL_PASSWORD)
    },
    optionalVars: OPTIONAL_VARS
  };
}

module.exports = { getConfig, validateEnvironment, REQUIRED_VARS, OPTIONAL_VARS };
