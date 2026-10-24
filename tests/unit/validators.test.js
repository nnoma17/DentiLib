/**
 * Tests unitaires des validations de donnees serveur.
 *
 * Ces fonctions paires constituent la premiere barriere de securite
 * contre les donnees malformees (OWASP A03 - Validation des donnees).
 */
const {
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isValidNumSecu,
  toPositiveInt,
  sanitizeText,
  isValidPrice
} = require("../../utils/validators");

describe("Validations serveur", () => {
  describe("isNonEmptyString", () => {
    test("accepte une chaine non vide", () => {
      expect(isNonEmptyString("DentiLib")).toBe(true);
    });

    test("refuse une chaine vide ou uniquement composee d'espaces", () => {
      expect(isNonEmptyString("")).toBe(false);
      expect(isNonEmptyString("   ")).toBe(false);
    });

    test("refuse une valeur non textuelle", () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(42)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    test("accepte une adresse valide", () => {
      expect(isValidEmail("admin@dentiLib.com")).toBe(true);
      expect(isValidEmail("prenom.nom@hopital.fr")).toBe(true);
    });

    test("refuse une adresse mal formee", () => {
      expect(isValidEmail("pas-un-email")).toBe(false);
      expect(isValidEmail("admin@")).toBe(false);
      expect(isValidEmail("admin@domaine")).toBe(false);
      expect(isValidEmail("@domaine.fr")).toBe(false);
      expect(isValidEmail("admin avec espace@domaine.fr")).toBe(false);
    });

    test("refuse une adresse trop longue", () => {
      expect(isValidEmail(`${"a".repeat(150)}@domaine.fr`)).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    test("accepte un mot de passe suffisamment long", () => {
      expect(isValidPassword("123456")).toBe(true);
      expect(isValidPassword("MotDePasse123")).toBe(true);
    });

    test("refuse un mot de passe trop court", () => {
      expect(isValidPassword("12345")).toBe(false);
      expect(isValidPassword("")).toBe(false);
    });

    test("refuse un mot de passe de plus de 72 octets (limite bcrypt)", () => {
      expect(isValidPassword("a".repeat(73))).toBe(false);
    });
  });

  describe("isValidNumSecu", () => {
    test("accepte un numero compose uniquement de chiffres", () => {
      expect(isValidNumSecu("1234567890123")).toBe(true);
    });

    test("refuse un numero contenant des lettres", () => {
      expect(isValidNumSecu("1234567890abc")).toBe(false);
      expect(isValidNumSecu("abc")).toBe(false);
    });

    test("refuse une longueur superieure a la colonne (15 caracteres)", () => {
      expect(isValidNumSecu("1".repeat(16))).toBe(false);
    });
  });

  describe("toPositiveInt", () => {
    test("convertit une chaine numerique en entier", () => {
      expect(toPositiveInt("42")).toBe(42);
      expect(toPositiveInt(42)).toBe(42);
    });

    test("refuse zero, les negatifs et les valeurs non numeriques", () => {
      expect(toPositiveInt(0)).toBeNull();
      expect(toPositiveInt(-1)).toBeNull();
      expect(toPositiveInt("abc")).toBeNull();
      expect(toPositiveInt(1.5)).toBeNull();
      expect(toPositiveInt(null)).toBeNull();
    });
  });

  describe("sanitizeText", () => {
    test("supprime les espaces en debut et fin", () => {
      expect(sanitizeText("  DentiLib  ")).toBe("DentiLib");
    });

    test("tronque a la longueur maximale", () => {
      expect(sanitizeText("a".repeat(50), 10)).toHaveLength(10);
    });

    test("retourne une chaine vide pour une valeur non textuelle", () => {
      expect(sanitizeText(null)).toBe("");
      expect(sanitizeText(undefined)).toBe("");
      expect(sanitizeText(42)).toBe("");
    });
  });

  describe("isValidPrice", () => {
    test("accepte un prix positif ou nul", () => {
      expect(isValidPrice(0)).toBe(true);
      expect(isValidPrice("12.50")).toBe(true);
    });

    test("refuse un prix negatif ou non numerique", () => {
      expect(isValidPrice(-1)).toBe(false);
      expect(isValidPrice("abc")).toBe(false);
      expect(isValidPrice(null)).toBe(false);
      expect(isValidPrice("")).toBe(false);
    });
  });
});
