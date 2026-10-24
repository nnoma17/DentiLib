const express = require("express");
const {
    createUser,
    createAdmin,
    deleteUser,
    updateUser,
    getUserById,
    getAllUsers,
    getAllDentists,
    getAllUsersNotAdmin
} = require("../../controllers/admin/gestionUser.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/authMiddleware");

const router = express.Router();

// Toutes les routes d'administration sont reservees au role ADMIN
// (OWASP A05 - Broken Access Control).
router.post("/admin/create_Admin", authMiddleware, requireRole("ADMIN"), createAdmin);
router.post('/admin/create_User', authMiddleware, requireRole("ADMIN"), createUser);
router.get('/admin/get_All_Users', authMiddleware, requireRole("ADMIN"), getAllUsers);
router.get('/admin/get_All_Dentists', authMiddleware, requireRole("ADMIN"), getAllDentists);
router.get('/admin/get_All_Users_Not_Admin', authMiddleware, requireRole("ADMIN"), getAllUsersNotAdmin);
router.put('/admin/update_User/:userId', authMiddleware, requireRole("ADMIN"), updateUser);
router.delete("/admin/delete_User/:userId", authMiddleware, requireRole("ADMIN"), deleteUser);

// Consultation d'un profil : l'ADMIN peut consulter tous les profils,
// un utilisateur authentifie ne peut consulter que le sien (verifie
// dans le controleur). Le hash du mot de passe n'est jamais renvoye.
router.get('/admin/get_User_ById/:userId', authMiddleware, getUserById);

module.exports = router;