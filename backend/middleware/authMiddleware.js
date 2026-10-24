const jwt = require("jsonwebtoken");
const { USER_ROLES } = require("../../utils/constants");

/**
 * Middleware d'authentification (OWASP A02 - Broken Authentication).
 *
 * - Verifie la presence et la signature du jeton JWT.
 * - Verifie la presence d'un identifiant et d'un role connus dans le jeton.
 * - Expose l'utilisateur verifie dans `req.user` (jamais `req.body`).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
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

    // Le role doit etre present ET connu : un jeton forje avec un role arbitraire
    // ne doit jamais donner acces a une ressource.
    if (!decoded?.role || !Object.values(USER_ROLES).includes(decoded.role)) {
      return res.status(403).json({ message: "Rôle non spécifié dans token" });
    }

    req.user = {
      id: Number(decoded.id),
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(400).json({ message: "token invalide", success: false });
  }
};

/**
 * Middleware de controle d'acces par role (OWASP A05 - Broken Access Control).
 *
 * A placer APRES authMiddleware sur la route :
 *   router.get("/admin/...", authMiddleware, requireRole("ADMIN"), handler)
 *
 * @param {...string} roles roles autorises
 * @returns {import('express').RequestHandler}
 */
const requireRole = (...roles) => {
  const allowed = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé pour votre rôle"
      });
    }

    next();
  };
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.requireRole = requireRole;