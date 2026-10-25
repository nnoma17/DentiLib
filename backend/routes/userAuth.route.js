const express = require("express");
const {
  loginUser,
  getMe,
  getAssociatedUser,
  exportMyData,
  deleteMyAccount
} = require("../controllers/userAuth.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

//Route de l'historique
router.post("/user/login_User", loginUser);
router.get('/prothesiste/me', authMiddleware, getMe);
router.get("/user/getAssociatedUser", authMiddleware, getAssociatedUser);
router.get("/user/export_my_data", authMiddleware, exportMyData);
router.delete("/user/delete_my_account", authMiddleware, deleteMyAccount);

module.exports = router;