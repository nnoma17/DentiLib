const express = require("express");
const {
    loginUser,
    getMe,
    getAssociatedUser
} = require("../controllers/userAuth.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//Route de l'historique
router.post("/user/login_User", loginUser);
router.get('/prothesiste/me', authMiddleware, getMe);
router.get("/user/getAssociatedUser", authMiddleware, getAssociatedUser);

module.exports = router;