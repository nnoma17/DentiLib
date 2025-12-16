const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

    try {
        if (!firstName || !lastName || !email || !password)
        return res.json({ success: false, message: "Champs manquants"});
        
    const alreadyExists = await User.findOne({ email });
    
    if (alreadyExists)
        return res.send({ success: false, message: "Email déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        role: role
    });
    await user.save();

    res.status(201).json({ success: true, message: "Utilisateur créé." });
    
    } catch (error) {
        res.status(500).json({message: "une erreur est survenu", error : error.message});

    }
};

const loginUser = async (req,res) => {
    const { email, password } = req.body;

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
    succes: true,
    message: "vous etes connecté",
    token,
    role: user.role,
  });
}

module.exports = {
    createUser,
    loginUser
};
