/**
 * Serialisation des entites exposees par l'API.
 *
 * Objectif : ne jamais renvoyer de donnee sensible (hash de mot de passe)
 * au client, quel que soit le controleur qui les expose.
 */

/**
 * Retoure la representation publique d'un utilisateur (sans hash de mot de passe).
 * @param {object|null} user instance Sequelize ou objet simple
 * @returns {object|null}
 */
function serializeUser(user) {
  if (!user) return null;

  const plain = typeof user.get === "function" ? user.get({ plain: true }) : { ...user };

  delete plain.password;

  return plain;
}

/**
 * Retoure la representation publique d'une liste d'utilisateurs.
 * @param {Array<object>} users
 * @returns {Array<object>}
 */
function serializeUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.map(serializeUser);
}

module.exports = { serializeUser, serializeUsers };
