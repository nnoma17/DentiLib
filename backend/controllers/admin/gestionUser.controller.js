const { Utilisateur, Log } = require("../../models");
const bcrypt = require("bcrypt");
const { sendUserCreationMail } = require("../../../utils/mailer");
const { Op } = require("sequelize");
const { serializeUser, serializeUsers } = require("../../utils/serializer");
const {
  isValidEmail,
  isValidPassword,
  sanitizeText,
  MAX_NAME_LENGTH
} = require("../../../utils/validators");
const { USER_ROLES } = require("../../../utils/constants");

/* =========================
   CREATE ADMIN
========================= */
const createAdmin = async (req, res) => {
  const { firstName, lastName, email, siret, password } = req.body;

  try {
    // Validation serveur : le client n'est jamais considere comme fiable.
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Champs manquants"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email invalide"
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Mot de passe trop court"
      });
    }

    const alreadyExists = await Utilisateur.findOne({
      where: { email }
    });


    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Email déjà utilisé"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Utilisateur.create({
      lastName: sanitizeText(lastName, MAX_NAME_LENGTH),
      firstName: sanitizeText(firstName, MAX_NAME_LENGTH),
      email: sanitizeText(email).toLowerCase(),
      password: hashedPassword,
      role: USER_ROLES.ADMIN,
      siret: sanitizeText(siret, 20)
    });

    await Log.create({
      user_id: user.id_user,
      action: "CREATION_ADMINISTRATEUR",
      target_id: user.id_user
    });

    return res.status(201).json({
      success: true,
      message: "Administrateur créé",
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
   CREATE USER (GENERAL)
========================= */
const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role, siret, dentisteId } = req.body;

  try {
    // Validation serveur : le client n'est jamais considere comme fiable.
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Champs manquants"
      });
    }

    // Le role doit faire partie de l'enum applicatif : un role arbitraire
    // ne doit pas pouvoir etre cree par l'API.
    if (![USER_ROLES.DENTISTE, USER_ROLES.PROTHESISTE].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Rôle invalide"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email invalide"
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Mot de passe trop court"
      });
    }

    const existingUser = await Utilisateur.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email déjà utilisé"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 création user
    const user = await Utilisateur.create({
      lastName: sanitizeText(lastName, MAX_NAME_LENGTH),
      firstName: sanitizeText(firstName, MAX_NAME_LENGTH),
      email: sanitizeText(email).toLowerCase(),
      password: hashedPassword,
      role,
      siret: sanitizeText(siret, 20)
    });

    // 🔗 liaison dentiste -> prothésiste
    if (role === "PROTHESISTE") {
      if (!dentisteId) {
        return res.status(400).json({
          success: false,
          message: "dentisteId requis"
        });
      }

      const dentiste = await Utilisateur.findOne({
        where: { id_user: dentisteId }
      });

      if (!dentiste || dentiste.role !== "DENTISTE") {
        return res.status(404).json({
          success: false,
          message: "Dentiste introuvable"
        });
      }

      await Utilisateur.update(
        { associatedUser: dentiste.id_user },
        { where: { id_user: user.id_user } }
      );

      await Utilisateur.update(
        { associatedUser: user.id_user },
        { where: { id_user: dentiste.id_user } }
      );
    }

    // L'envoi du mail ne doit pas faire echouer la creation du compte
    // (le serveur de messagerie peut etre indisponible).
    try {
      await sendUserCreationMail(email, firstName, password);
    } catch (mailError) {
      console.error("[MAIL] Envoi du mail de creation impossible :", mailError.message);
    }

    await Log.create({
      user_id: req.user.id,
      action: "CREATION_UTILISATEUR",
      target_id: user.id_user
    });

    return res.status(201).json({
      success: true,
      message: "Utilisateur créé",
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
   DELETE USER
========================= */
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Utilisateur.findOne({
      where: { id_user: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    await Utilisateur.destroy({
      where: { id_user: userId }
    });

    await Log.create({
      user_id: req.user.id,
      action: "SUPPRESSION_UTILISATEUR",
      target_id: userId
    });

    return res.status(200).json({
      success: true,
      message: "Utilisateur supprimé"
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
   UPDATE USER
========================= */
const updateUser = async (req, res) => {
  const { firstName, lastName, email, siret, role, password } = req.body;
  const userId = req.params.userId;

  try {
    const user = await Utilisateur.findOne({
      where: { id_user: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    if (email && email !== user.email) {
      const emailExists = await Utilisateur.findOne({
        where: { email }
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email déjà utilisé"
        });
      }
    }

    const updateData = {
      lastName: lastName || user.lastName,
      firstName: firstName || user.firstName,
      email: email || user.email,
      siret: siret || user.siret,
      role: role || user.role
    };

    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await Utilisateur.update(updateData, { where: { id_user: userId } });

    await Log.create({
      user_id: req.user.id,
      action: "MISE_A_JOUR_UTILISATEUR",
      target_id: userId
    });

    return res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour"
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
   GETTERS
========================= */
const getUserById = async (req, res) => {
  try {
    const user = await Utilisateur.findOne({
      where: { id_user: req.params.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

    // Controle d'acces : l'ADMIN peut consulter tous les profils,
    // un utilisateur authentifie ne peut consulter que le sien.
    const isSelf = Number(req.params.userId) === Number(req.user?.id);
    if (req.user?.role !== "ADMIN" && !isSelf) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé pour votre rôle"
      });
    }

    // Le hash du mot de passe ne doit jamais quitter le serveur.
    return res.status(200).json({ success: true, user: serializeUser(user) });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await Utilisateur.findAll();
    return res.status(200).json({ success: true, users: serializeUsers(users) });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllDentists = async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      where: { role: "DENTISTE" }
    });

    return res.status(200).json({ success: true, users: serializeUsers(users) });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllUsersNotAdmin = async (req, res) => {
  try {
    const users = await Utilisateur.findAll({
      where: {
        role: { [Op.ne]: "ADMIN" }
      }
    });

    return res.status(200).json({ success: true, users: serializeUsers(users) });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


/* =========================
   EXPORT
========================= */
module.exports = {
  createAdmin,
  createUser,
  deleteUser,
  updateUser,
  getUserById,
  getAllUsers,
  getAllDentists,
  getAllUsersNotAdmin
};