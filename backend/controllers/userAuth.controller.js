const User = require("../models/utilisateur");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isValidEmail, isNonEmptyString, sanitizeText } = require("../../utils/validators");
const { serializeUser } = require("../utils/serializer");
const { FicheTravaux, Log } = require("../models");

/* =========================
   LOGIN USER
========================= */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation serveur des donnees de connexion.
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({
        success: false,
        message: "Champs manquants"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(404).json({
        success: false,
        message: "L'utilisateur n'existe pas"
      });
    }

    const user = await User.findOne({
      where: { email: sanitizeText(email).toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "L'utilisateur n'existe pas"
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect"
      });
    }

    // Le jeton ne contient que l'identifiant et le role : aucune donnee
    // sensible (email, nom, hash) n'y figure.
    const token = jwt.sign(
      {
        id: user.id_user,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Vous êtes connecté",
      token,
      role: user.role,
      user: serializeUser(user)
    });

  } catch (error) {
    return res.status(500).json({
      message: "Une erreur est survenue",
      error: error.message
    });
  }
};


/* =========================
   GET ME
========================= */
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id_user: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    return res.json({
      success: true,
      user: serializeUser(user)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};


/* =========================
   GET ASSOCIATED USER
========================= */
const getAssociatedUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({
      where: { id_user: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    if (!user.associatedUser) {
      return res.status(404).json({
        success: false,
        message: "Aucun utilisateur associé"
      });
    }

    const associatedUser = await User.findOne({
      where: { id_user: user.associatedUser }
    });

    if (!associatedUser) {
      return res.status(404).json({
        success: false,
        message: "Aucun utilisateur associé"
      });
    }

    return res.json({
      success: true,
      associatedUser: serializeUser(associatedUser)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/* =========================
   RGPD - EXPORT DE MES DONNEES (art. 15 et 20)
========================= */
const exportMyData = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id_user: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const worksheets = await FicheTravaux.findAll({
      where: req.user.role === "PROTHESISTE"
        ? { idProthesiste: req.user.id }
        : { idDentist: req.user.id }
    });

    await Log.create({ user_id: req.user.id, action: "EXPORT_DONNEES_RGPD", target_id: req.user.id });

    res.setHeader("Content-Disposition", "attachment; filename=mes-donnees.json");
    return res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      user: serializeUser(user),
      worksheets
    });
  } catch (error) {
    console.error("exportMyData:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const deleteMyAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (req.user.role === "ADMIN") {
      return res.status(403).json({ success: false, message: "Un administrateur ne peut pas supprimer son compte" });
    }
    if (!isNonEmptyString(password)) {
      return res.status(400).json({ success: false, message: "Mot de passe requis pour confirmer" });
    }

    const user = await User.findOne({ where: { id_user: req.user.id } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }

    // Détache l'utilisateur associé
    if (user.associatedUser) {
      await User.update({ associatedUser: null }, { where: { id_user: user.associatedUser } });
    }

    await User.update(
      {
        firstName: "Utilisateur",
        lastName: "Supprimé",
        email: `supprime_${user.id_user}@anonyme.invalid`,
        siret: null,
        associatedUser: null,
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
      },
      { where: { id_user: user.id_user } }
    );

    await Log.create({ user_id: user.id_user, action: "SUPPRESSION_COMPTE_RGPD", target_id: user.id_user });

    return res.json({ success: true, message: "Compte supprimé" });
  } catch (error) {
    console.error("deleteMyAccount:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

module.exports = {
  loginUser,
  getMe,
  getAssociatedUser,
  exportMyData,
  deleteMyAccount
};