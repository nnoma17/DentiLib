/**
 * Tests unitaires du controle d'acces sur les fiches de travaux.
 *
 * Cible : OWASP A05 - Broken Access Control (notamment l'IDOR :
 * un utilisateur ne doit pas pouvoir lire la fiche d'un autre en
 * devinant l'identifiant).
 */
jest.mock("../../backend/models", () => {
  const mockModel = {
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    belongsToMany: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn()
  };

  return {
    Utilisateur: mockModel,
    FicheTravaux: mockModel,
    Log: mockModel,
    CatalogueProthesiste: mockModel,
    Acte: mockModel,
    FicheTravauxActe: mockModel,
    sequelize: { authenticate: jest.fn(), close: jest.fn() }
  };
});

const { Op } = require("sequelize");
const { FicheTravaux } = require("../../backend/models");
const { buildWorksheetScope, findAccessibleWorksheet } = require("../../backend/utils/accessControl");
const { USER_ROLES, WORKSHEET_STATUS } = require("../../utils/constants");

describe("Controle d'acces sur les fiches de travaux", () => {
  beforeEach(() => {
    FicheTravaux.findOne.mockReset();
  });

  describe("buildWorksheetScope", () => {
    test("le dentiste ne voit que les fiches qu'il a creees", () => {
      const scope = buildWorksheetScope({ id: 7, role: USER_ROLES.DENTISTE });

      expect(scope).toEqual({ idDentist: 7 });
    });

    test("le prothesiste ne voit que les fiches qui lui sont confiees et validees", () => {
      const scope = buildWorksheetScope({ id: 9, role: USER_ROLES.PROTHESISTE });

      expect(scope.idProthesiste).toBe(9);
      expect(scope.status[Op.ne]).toBe(WORKSHEET_STATUS.A_VALIDER);
    });

    test("l'administrateur n'est pas restreint (back-office)", () => {
      expect(buildWorksheetScope({ id: 1, role: USER_ROLES.ADMIN })).toEqual({});
    });

    test("un utilisateur sans role n'obtient aucune fiche", () => {
      expect(buildWorksheetScope(null)).toEqual({ idWorkSheet: -1 });
      expect(buildWorksheetScope({ id: 1, role: "PIRATE" })).toEqual({ idWorkSheet: -1 });
    });
  });

  describe("findAccessibleWorksheet", () => {
    test("interroge la base avec la clause de propriete", async () => {
      FicheTravaux.findOne.mockResolvedValue(null);

      await findAccessibleWorksheet({ id: 7, role: USER_ROLES.DENTISTE }, 42);

      expect(FicheTravaux.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idWorkSheet: 42, idDentist: 7 }
        })
      );
    });

    test("refuse un identifiant de fiche invalide sans toucher la base", async () => {
      const result = await findAccessibleWorksheet(
        { id: 7, role: USER_ROLES.DENTISTE },
        "abc"
      );

      expect(result).toBeNull();
      expect(FicheTravaux.findOne).not.toHaveBeenCalled();
    });

    test("refuse un identifiant negatif ou nul", async () => {
      expect(await findAccessibleWorksheet({ id: 7, role: USER_ROLES.DENTISTE }, 0)).toBeNull();
      expect(await findAccessibleWorksheet({ id: 7, role: USER_ROLES.DENTISTE }, -3)).toBeNull();
      expect(FicheTravaux.findOne).not.toHaveBeenCalled();
    });

    test("retourne null quand la fiche n'appartient pas a l'utilisateur", async () => {
      FicheTravaux.findOne.mockResolvedValue(null);

      const result = await findAccessibleWorksheet(
        { id: 7, role: USER_ROLES.DENTISTE },
        42
      );

      expect(result).toBeNull();
    });

    test("transmet les options Sequelize (include) en conservant la clause where", async () => {
      FicheTravaux.findOne.mockResolvedValue(null);

      await findAccessibleWorksheet(
        { id: 7, role: USER_ROLES.DENTISTE },
        42,
        { include: [{ model: "Acte" }] }
      );

      expect(FicheTravaux.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [{ model: "Acte" }],
          where: { idWorkSheet: 42, idDentist: 7 }
        })
      );
    });
  });
});
