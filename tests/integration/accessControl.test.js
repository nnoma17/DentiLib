require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

jest.mock('../../backend/models', () => {
  const mockModel = { hasMany: jest.fn(), belongsTo: jest.fn(), belongsToMany: jest.fn(), findOne: jest.fn(), findAll: jest.fn() };
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
const jwt = require("jsonwebtoken");
const app = require("../../app");

const tokenFor = (role) => jwt.sign({ id: 1, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Contrôle d'accès par rôle (OWASP A01)", () => {
  const url = "/api/admin/gestionProcedure/get_All_Procedures";

  test("sans token → 401", async () => {
    expect((await request(app).get(url)).statusCode).toBe(401);
  });

  test("dentiste sur route admin → 403", async () => {
    const res = await request(app).get(url).set("Authorization", `Bearer ${tokenFor("DENTISTE")}`);
    expect(res.statusCode).toBe(403);
  });

  test("prothésiste sur route dentiste → 403", async () => {
    const res = await request(app)
      .get("/api/admin/gestionWorksheet/get_all_worksheet_by_dentiste")
      .set("Authorization", `Bearer ${tokenFor("PROTHESISTE")}`);
    expect(res.statusCode).toBe(403);
  });
});