const express = require("express");
const {
    createUser,
    createAdmin,
    loginUser,
    deleteUser,
    deleteActualUser
} = require("../controllers/userAuth.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//Route de l'historique
router.post("/user/create_User",authMiddleware, createUser);
router.post("/user/create_Admin", createAdmin);
router.post("/user/login_User", loginUser);
router.delete("/user/delete_User/:userId",authMiddleware, deleteUser);
router.delete('/user/delete_actual_user',authMiddleware, deleteActualUser);

module.exports = router;