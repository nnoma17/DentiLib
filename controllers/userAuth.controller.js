const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const loginUser = async (req,res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ succes: false, message: "L'utilisateur n'existe pas" });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ succes: false, message: "mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, prenom: user.firstName },
            process.env.JWT_SECRET,
            {
            expiresIn: "1h",
            }
        );

        res.json({
            message: "vous etes connecté",
            token,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({message: "une erreur est survenu", error : error.message});
    }
}


module.exports = {
    loginUser
};
