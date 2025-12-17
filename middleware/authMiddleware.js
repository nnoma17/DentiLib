const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(403).json({ message: "token no trouvé ou invalide" });
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id)
      return res.status(403).json({ message: "token invalide" });

    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "token invalide", success: false });
  }
};
module.exports = authMiddleware;
