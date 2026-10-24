/**
 * Tests unitaires du serialiseur : le hash du mot de passe ne doit
 * jamais quitter le serveur (OWASP A02 - Sensitive Data Exposure).
 */
const { serializeUser, serializeUsers } = require("../../backend/utils/serializer");

/**
 * Simule une instance Sequelize (avec la methode get()).
 */
function buildUser(overrides = {}) {
  const data = {
    id_user: 1,
    firstName: "Jean",
    lastName: "Admin",
    email: "admin@dentiLib.com",
    password: "$2b$10$unHashBcryptTresLongEtSecurise1234567890",
    role: "ADMIN",
    ...overrides
  };

  return {
    get: () => ({ ...data }),
    dataValues: data
  };
}

describe("Serialisation des utilisateurs", () => {
  test("supprime le hash du mot de passe", () => {
    const result = serializeUser(buildUser());

    expect(result).not.toHaveProperty("password");
    expect(result.email).toBe("admin@dentiLib.com");
    expect(result.role).toBe("ADMIN");
  });

  test("fonctionne avec un objet simple (non Sequelize)", () => {
    const result = serializeUser({
      id_user: 2,
      email: "dentiste@dentiLib.com",
      password: "hash"
    });

    expect(result).not.toHaveProperty("password");
    expect(result.id_user).toBe(2);
  });

  test("retourne null pour un utilisateur absent", () => {
    expect(serializeUser(null)).toBeNull();
    expect(serializeUser(undefined)).toBeNull();
  });

  test("serialise une liste entiere sans aucun hash", () => {
    const users = [buildUser(), buildUser({ id_user: 2, role: "DENTISTE" })];

    const result = serializeUsers(users);

    expect(result).toHaveLength(2);
    for (const user of result) {
      expect(user).not.toHaveProperty("password");
    }
  });

  test("retourne un tableau vide pour une liste invalide", () => {
    expect(serializeUsers(null)).toEqual([]);
    expect(serializeUsers(undefined)).toEqual([]);
  });
});
