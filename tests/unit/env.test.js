/**
 * Tests unitaires de la configuration d'environnement.
 *
 * Cible RNCP : "Integrer les exigences de securite des la configuration
 * initiale (gestion securisee des variables d'environnement)".
 */
const { validateEnvironment, getConfig, REQUIRED_VARS } = require("../../backend/config/env");

describe("Configuration d'environnement", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Configuration valide de reference.
    process.env.JWT_SECRET = "un-secret-tres-long-et-aleatoire-0123456789";
    process.env.DB_HOST = "localhost";
    process.env.DB_PORT = "3306";
    process.env.DB_NAME = "dentilib";
    process.env.DB_USER = "dentilib_user";
    process.env.DB_PASSWORD = "motdepasse";
    process.env.MAIL_USER = "";
    process.env.MAIL_PASSWORD = "";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("accepte une configuration complete et valide", () => {
    expect(() => validateEnvironment()).not.toThrow();
  });

  test("refuse de demarrer si une variable critique est absente", () => {
    for (const variable of REQUIRED_VARS) {
      const saved = process.env[variable.name];
      delete process.env[variable.name];

      expect(() => validateEnvironment()).toThrow(
        new RegExp(variable.name)
      );

      process.env[variable.name] = saved;
    }
  });

  test("refuse une variable critique vide", () => {
    process.env.DB_PASSWORD = "   ";

    expect(() => validateEnvironment()).toThrow(/DB_PASSWORD/);
  });

  test("refuse une cle JWT trop faible", () => {
    process.env.JWT_SECRET = "court";

    expect(() => validateEnvironment()).toThrow(/JWT_SECRET/);
  });

  test("refuse un port de base de donnees invalide", () => {
    process.env.DB_PORT = "abc";

    expect(() => validateEnvironment()).toThrow(/DB_PORT/);
  });

  test("refuse un port de base de donnees hors bornes", () => {
    process.env.DB_PORT = "70000";

    expect(() => validateEnvironment()).toThrow(/DB_PORT/);
  });

  test("expose la configuration applicative apres validation", () => {
    const config = getConfig();

    expect(config.port).toBe(3000);
    expect(config.database.name).toBe("dentilib");
    expect(config.database.user).toBe("dentilib_user");
    expect(config.isProduction).toBe(false);
  });

  test("desactive l'envoi d'e-mail si les identifiants sont absents", () => {
    const config = getConfig();

    expect(config.mail.enabled).toBe(false);
  });
});
