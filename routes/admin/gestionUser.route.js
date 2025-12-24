const express = require("express");
const {
    createUser,
    createAdmin,
    deleteUser,
//    deleteActualUser,
    updateUser,
    getUserById,
    getAllUsers,
    getAllDentists,
    getAllUsersNotAdmin
} = require("../../controllers/admin/gestionUser.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();
router.post("/admin/create_Admin", createAdmin);
router.post('/admin/create_User', authMiddleware, createUser);
router.get('/admin/get_User_ById/:userId', authMiddleware, getUserById);
router.get('/admin/get_All_Users', authMiddleware, getAllUsers);
router.get('/admin/get_All_Dentists', authMiddleware, getAllDentists);
router.get('/admin/get_All_Users_Not_Admin', authMiddleware, getAllUsersNotAdmin);
router.put('/admin/update_User/:userId', authMiddleware, updateUser);
router.delete("/admin/delete_User/:userId",authMiddleware, deleteUser);

module.exports = router;