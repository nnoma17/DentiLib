const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createNewUser = async (req, res) => {
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

//mise a jour d'un utilisateur que l'admin va selectionner
const updateUser = async (req, res) => {
    const { firstName, lastName, email, siret, roles} = req.body;
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: userId +"Utilisateur non trouvé"
            });
        }

        if (email && email !== user.email) { //Si different de l'actuel on verifie que le mail n'est pas atribué
            const emailAlreadyUsed = await User.findOne({ email });

            if (emailAlreadyUsed) {
                return res.status(409).json({
                success: false,
                message: "Cet email est déjà utilisé"
                });
            }
        }

        //mise a jour de l'utilisateur selectionnner avec tous les champs fournis
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.siret = siret || user.siret;
        user.roles = roles || user.roles;

        await user.save();

        res.status(200).json({ success: true, message: "Utilisateur mis à jour", user });
        

    }catch(error){
        res.status(500).json({message: "une erreur est survenu", error : error.message});
    }
}

const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,        
      siret,
      listeActes,
      dentisteId  
    } = req.body
 
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      siret,
      listeActes,
      associatedUser: null
    })
 
    await user.save()
 
    if (role === 'DENTISTE') {
      return res.status(201).json({
        message: 'Dentiste created',
        user
      })
    }
 
    if (role === 'PROTHESISTE') {
      if (!dentisteId) {
        return res.status(400).json({
          message: 'dentisteId is required for prothesiste'
        })
      }
 
      const dentiste = await User.findById(dentisteId)
 
      if (!dentiste || dentiste.role !== 'DENTISTE') {
        return res.status(404).json({
          message: 'Dentiste not found'
        })
      }
 
      user.associatedUser = dentiste._id
      dentiste.associatedUser = user._id
 
      await user.save()
      await dentiste.save()
 
      return res.status(201).json({
        message: 'Prothesiste created and linked to dentiste',
        prothesiste: user,
        dentiste
      })
    }
 
    return res.status(400).json({ message: 'Invalid role' })
 
  } catch (error) {
    res.status(500).json({ message: 'Server error', error : error.message })
  }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });

    } catch (error){
        res.status(500).json({message: "une erreur est survenu", error : error.message});
    }
}

module.exports = {
    createAdmin,
    deleteUser,
    updateUser,
    createUser,
    getAllUsers
};
