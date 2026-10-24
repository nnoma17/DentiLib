/**
 * Tests unitaires du middleware d'authentification et du controle d'acces par role.
 *
 * Cible : OWASP A02 (Broken Authentication) et A05 (Broken Access Control).
 */
const jwt = require("jsonwebtoken");
const authMiddleware = require("../../backend/middleware/authMiddleware");
const { requireRole } = require("../../backend/middleware/authMiddleware");

const JWT_SECRET = "secret-de-test-uniquement-local-0123456789abcdef";

describe("Middleware d'authentification", () => {
  let res;
  let next;

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  /**
   * Construit un jeton JWT valide.
   */
  function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  }

  test("refuse une requete sans en-tete Authorization", () => {
    authMiddleware({ headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("refuse un en-tete Authorization qui n'est pas un Bearer", () => {
    authMiddleware({ headers: { authorization: "Basic abcdef" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("refuse un jeton invalide ou signe avec une autre cle", () => {
    const forged = jwt.sign({ id: 1, role: "ADMIN" }, "autre-cle-secrete");

    authMiddleware({ headers: { authorization: `Bearer ${forged}` } }, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("refuse un jeton expire", () => {
    const expired = jwt.sign({ id: 1, role: "ADMIN" }, JWT_SECRET, { expiresIn: -10 });

    authMiddleware({ headers: { authorization: `Bearer ${expired}` } }, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("refuse un jeton sans identifiant", () => {
    const token = signToken({ role: "ADMIN" });

    authMiddleware({ headers: { authorization: `Bearer ${token}` } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("refuse un jeton sans role", () => {
    const token = signToken({ id: 1 });

    authMiddleware({ headers: { authorization: `Bearer ${token}` } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("refuse un jeton portant un role arbitraire (jeton forge)", () => {
    const token = signToken({ id: 1, role: "SUPER_ADMIN" });

    authMiddleware({ headers: { authorization: `Bearer ${token}` } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Rôle non spécifié dans token" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("accepte un jeton valide et expose l'utilisateur verifie", () => {
    const token = signToken({ id: 7, role: "DENTISTE" });

    authMiddleware({ headers: { authorization: `Bearer ${token}` } }, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("Middleware de controle d'acces par role (requireRole)", () => {
  let res;
  let next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test("refuse l'acces si l'utilisateur n'est pas authentifie", () => {
    requireRole("ADMIN")({ user: undefined }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("autorise un utilisateur dont le role correspond", () => {
    requireRole("ADMIN")({ user: { id: 1, role: "ADMIN" } }, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("refuse un utilisateur dont le role ne correspond pas", () => {
    requireRole("ADMIN")({ user: { id: 1, role: "DENTISTE" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("accepte plusieurs roles autorises", () => {
    requireRole("DENTISTE", "PROTHESISTE")({ user: { id: 1, role: "PROTHESISTE" } }, res, next);

    expect(next).toHaveBeenCalled();
  });
});
