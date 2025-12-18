const express = require("express");
const {
    loginUser
} = require("../controllers/userAuth.controller");

const router = express.Router();

//Route de l'historique
router.post("/user/login_User", loginUser);

module.exports = router;