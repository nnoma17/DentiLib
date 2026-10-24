/**
 * Tests unitaires des regles de gestion metier (workflow des fiches).
 *
 * Ces fonctions sont pures : elles sont testees sans base de donnees.
 */
const {
  canSetStatus,
  canActOnStatus,
  canDeleteWorksheet,
  canViewWorksheet
} = require("../../utils/workflow");
const { USER_ROLES, WORKSHEET_STATUS } = require("../../utils/constants");

describe("Regles de gestion - workflow des fiches de travaux", () => {
  describe("canSetStatus (statuts autorises par role)", () => {
    test("le dentiste peut valider la fiche (A valider -> En attente)", () => {
      expect(canSetStatus(USER_ROLES.DENTISTE, WORKSHEET_STATUS.EN_ATTENTE)).toBe(true);
    });

    test("le dentiste ne peut pas cloturer la fiche lui-meme", () => {
      expect(canSetStatus(USER_ROLES.DENTISTE, WORKSHEET_STATUS.TERMINE)).toBe(false);
      expect(canSetStatus(USER_ROLES.DENTISTE, WORKSHEET_STATUS.EN_COURS)).toBe(false);
    });

    test("le prothesiste fait passer la fiche en En cours puis Termine", () => {
      expect(canSetStatus(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.EN_COURS)).toBe(true);
      expect(canSetStatus(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.TERMINE)).toBe(true);
    });

    test("le prothesiste ne peut pas annuler une fiche", () => {
      expect(canSetStatus(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.A_VALIDER)).toBe(false);
    });

    test("un role inconnu ne peut changer aucun statut", () => {
      expect(canSetStatus("PIRATE", WORKSHEET_STATUS.TERMINE)).toBe(false);
      expect(canSetStatus(undefined, WORKSHEET_STATUS.TERMINE)).toBe(false);
    });

    test("l'administrateur peut placer la fiche dans n'importe quel statut", () => {
      for (const status of Object.values(WORKSHEET_STATUS)) {
        expect(canSetStatus(USER_ROLES.ADMIN, status)).toBe(true);
      }
    });
  });

  describe("canActOnStatus (droits d'intervention sur l'etat courant)", () => {
    test("le dentiste n'agit que sur une fiche non encore transmise", () => {
      expect(canActOnStatus(USER_ROLES.DENTISTE, WORKSHEET_STATUS.A_VALIDER)).toBe(true);
      expect(canActOnStatus(USER_ROLES.DENTISTE, WORKSHEET_STATUS.EN_ATTENTE)).toBe(false);
      expect(canActOnStatus(USER_ROLES.DENTISTE, WORKSHEET_STATUS.EN_COURS)).toBe(false);
    });

    test("le prothesiste n'agit pas sur une fiche encore en validation", () => {
      expect(canActOnStatus(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.A_VALIDER)).toBe(false);
      expect(canActOnStatus(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.EN_ATTENTE)).toBe(true);
      expect(canActOnStatus(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.TERMINE)).toBe(true);
    });
  });

  describe("canDeleteWorksheet", () => {
    test("le dentiste peut supprimer une fiche non transmise ou terminee", () => {
      expect(canDeleteWorksheet(USER_ROLES.DENTISTE, WORKSHEET_STATUS.A_VALIDER)).toBe(true);
      expect(canDeleteWorksheet(USER_ROLES.DENTISTE, WORKSHEET_STATUS.TERMINE)).toBe(true);
    });

    test("le dentiste ne peut pas supprimer une fiche en cours de traitement", () => {
      expect(canDeleteWorksheet(USER_ROLES.DENTISTE, WORKSHEET_STATUS.EN_ATTENTE)).toBe(false);
      expect(canDeleteWorksheet(USER_ROLES.DENTISTE, WORKSHEET_STATUS.EN_COURS)).toBe(false);
    });

    test("le prothesiste ne supprime jamais de fiche", () => {
      expect(canDeleteWorksheet(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.A_VALIDER)).toBe(false);
      expect(canDeleteWorksheet(USER_ROLES.PROTHESISTE, WORKSHEET_STATUS.TERMINE)).toBe(false);
    });
  });

  describe("canViewWorksheet", () => {
    test("seuls les roles applicatifs connus peuvent consulter des fiches", () => {
      expect(canViewWorksheet(USER_ROLES.DENTISTE)).toBe(true);
      expect(canViewWorksheet(USER_ROLES.PROTHESISTE)).toBe(true);
      expect(canViewWorksheet(USER_ROLES.ADMIN)).toBe(true);
      expect(canViewWorksheet("PIRATE")).toBe(false);
      expect(canViewWorksheet(undefined)).toBe(false);
    });
  });
});
