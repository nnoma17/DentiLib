/**
 * Tests unitaires de createAdmin (controleur gestionUser).
 *
 * Les dependances (modeles Sequelize, bcrypt, mailer) sont simulees :
 * aucun acces a MySQL, seul le controleur est teste.
 */
jest.mock("../../backend/models", () => ({
  Utilisateur: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  Log: {
    create: jest.fn()
  },
  sequelize: { transaction: jest.fn() }
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn()
}));

jest.mock("../../utils/mailer", () => ({
  sendUserCreationMail: jest.fn()
}));

const bcrypt = require("bcrypt");
const { Utilisateur, Log } = require("../../backend/models");
const { createAdmin } = require("../../backend/controllers/admin/gestionUser.controller");
const { USER_ROLES } = require("../../utils/constants");

// Faux objet "res" Express : status() renvoie res pour permettre status().json()
function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("createAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Creer un administrateur avec des donnees valides", async () => {
    // Arrange : email libre, hash simule, utilisateur retourne par la "base"
    Utilisateur.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("motDePasseHache");
    Utilisateur.create.mockResolvedValue({
      id_user: 5,
      lastName: "NomAdmin",
      firstName: "Anna",
      email: "admin@email.fr",
      password: "motDePasseHache",
      role: USER_ROLES.ADMIN,
      siret: "12345678901234"
    });
    Log.create.mockResolvedValue({});

    const req = {
      body: {
        firstName: "Anna",
        lastName: "NomAdmin",
        email: "Admin@Email.fr",
        siret: "12345678901234",
        password: "MotDePasse12345"
      }
    };
    const res = mockResponse();

    await createAdmin(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("MotDePasse12345", 10);
    expect(Utilisateur.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin@email.fr", // mis en minuscules
        password: "motDePasseHache", // jamais le mot de passe en clair
        role: USER_ROLES.ADMIN
      })
    );
    expect(Log.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREATION_ADMINISTRATEUR", target_id: 5 })
    );
    expect(res.status).toHaveBeenCalledWith(201);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.user.email).toBe("admin@email.fr");
    expect(body.user.password).toBeUndefined(); // le hash n'est pas expose
  });

  test("Creation avec des champs obligatoires sont manquants", async () => {
    const req = {
      body: {
        firstName: "Anna",
        lastName: "NomAdmin",
        // email manquant
        password: "MotDePasse12345"
      }
    };
    const res = mockResponse();

    await createAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Champs manquants"
    });
  });
});