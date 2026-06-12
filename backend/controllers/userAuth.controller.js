const User = require("../models/utilisateur");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* =========================
   LOGIN USER
========================= */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email }
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
      role: user.role
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
      user
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

    return res.json({
      success: true,
      associatedUser
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
   EXPORT
========================= */
module.exports = {
  loginUser,
  getMe,
  getAssociatedUser
};