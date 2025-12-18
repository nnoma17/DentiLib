const express = require("express");
const {
    createUser,
    createAdmin,
    deleteUser,
//    deleteActualUser,
    updateUser,
    getAllUsers
} = require("../../controllers/admin/gestionUser.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();
router.post("/admin/create_Admin", createAdmin);
router.post('/admin/create_Account', authMiddleware, createUser);
router.get('/admin/get_All_Users', authMiddleware, getAllUsers);
router.put('/admin/update_User/:userId', authMiddleware, updateUser);
router.delete("/admin/delete_User/:userId",authMiddleware, deleteUser);

module.exports = router;