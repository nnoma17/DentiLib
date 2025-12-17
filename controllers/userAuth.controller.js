const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const { firstName, lastName, email, siret, password, role } = req.body;

    try {
        if (!firstName || !lastName || !email || !password)
        return res.json({ success: false, message: "Champs manquants"});
        
    const alreadyExists = await User.findOne({ email });
    
    if (alreadyExists)
      return res.status(409).json({ success: false, message: "Email déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        siret: siret,
        password: hashedPassword,
        role: role
    });
    await user.save();

    res.status(201).json({ success: true, message: "Utilisateur créé.", user });
    
    } catch (error) {
        res.status(500).json({message: "une erreur est survenu", error : error.message});

    }
};

const createAdmin = async (req, res) => {
  const { firstName, lastName, email, siret, password } = req.body;

    try {
        if (!firstName || !lastName || !email || !password)
        return res.status(400).json({ success: false, message: "Champs manquants"});
        
    const alreadyExists = await User.findOne({ email });
    
    if (alreadyExists)
      return res.status(409).json({ success: false, message: "Email déjà utilisé." });

    //Le format de l'email est incorrect
    //expliquation de la regex :
    //^[^\s@]+      : commence par un ou plusieurs caractères qui ne sont pas des espaces ou des @
    //@             : suivi d'un @
    //[^\s@]+       : suivi d'un ou plusieurs caractères qui ne sont pas des espaces ou des @
    //\.            : suivi d'un point littéral
    //[^\s@]+$      : se termine par un ou plusieurs caractères qui ne sont pas des espaces ou des @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){ //.test() test une regex
        return res.status(400).json({ success: false, message: "Le format de l'email est incorrect."});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //Mot de passe trop court
    if(password.length <6){
        return  res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 6 caractères."});
    }

    const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        siret: siret,
        password: hashedPassword,
        role: "ADMIN"
    });
    await user.save();

    res.status(201).json({ success: true, message: "Utilisateur créé", user });
    
    } catch (error) {
        res.status(500).json({message: "une erreur est survenu", error : error.message});

    }
};

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

const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }
        
        await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "Utilisateur supprimé"});
    
    } catch (error) {
        res.status(500).json({message: "une erreur est survenu", error : error.message});

    }
}

const deleteActualUser = async (req,res) => {
    try {
        const userIdToDelete = req.user.id;
        const connectedUser = req.user;
 
        if (connectedUser.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }
        // 3️⃣ Vérifier si l'admin existe
        const user = await User.findById(userIdToDelete);
 
        if (!user) {
            return res.status(404).json({
                message: "Admin not found."
            });
        }
 
 
        await User.findByIdAndDelete(userIdToDelete);
 
        return res.status(200).json({
            message: "User deleted successfully."
        });
 
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
}

module.exports = {
    createUser,
    loginUser,
    createAdmin,
    deleteUser,
    deleteActualUser
};
