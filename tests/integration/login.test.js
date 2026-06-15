require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

jest.mock('../../backend/models', () => {
  const mockModel = { hasMany: jest.fn(), belongsTo: jest.fn(), findOne: jest.fn() };
  return {
    Utilisateur: mockModel,
    FicheTravaux: mockModel,
    Log: mockModel,
    CatalogueProthesiste: mockModel,
    Acte: mockModel,
    FicheTravauxActe: mockModel,
    sequelize: { authenticate: jest.fn().mockResolvedValue(true), close: jest.fn() }
  };
});

const request = require("supertest");
const app = require("../../app");

describe("POST /api/user/login_User", () => {
  jest.setTimeout(20000);

  test("login valide", async () => {
    const response = await request(app)
      .post("/api/user/login_User")
      .send({
        email: "admin@email.fr",
        password: "12345678"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("email incorrect", async () => {
    const response = await request(app)
      .post("/api/user/login_User")
      .send({
        email: "emailFaux@gmail.com",
        password: "12345678"
      });

    expect(response.statusCode).toBe(404);
  });

  test("mot de passe incorrect", async () => {
    const response = await request(app)
      .post("/api/user/login_User")
      .send({
        email: "admin@email.fr",
        password: "mauvaisMDP"
      });

    expect(response.statusCode).toBe(401);
  });
});