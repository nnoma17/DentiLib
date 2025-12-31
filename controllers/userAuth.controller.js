const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Connexion utilisateur
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "L'utilisateur n'existe pas" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, prenom: user.firstName },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Vous êtes connecté",
            token,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue", error: error.message });
    }
};

// Récupérer l'utilisateur connecté complet
const getMe = async (req, res) => {
    try {
        const userId = req.user.id; // défini par le middleware auth
        const user = await User.findById(userId).populate("listeActes.acte");

        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
    }
};

const getAssociatedUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate("associatedUser");

        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        if (!user.associatedUser) {
            return res.status(404).json({ success: false, message: "Aucun utilisateur associé" });
        }

        res.json({ success: true, associatedUser: user.associatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

module.exports = {
    loginUser,
    getMe,
    getAssociatedUser
};
