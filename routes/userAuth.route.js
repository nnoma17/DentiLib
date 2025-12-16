const express = require("express");
const {
    createUser,
    loginUser
} = require("../controllers/userAuth.controller");

const router = express.Router();

//Route de l'historique
router.post("/user/create_User", createUser);
router.post("/user/login_User", loginUser);

module.exports = router;