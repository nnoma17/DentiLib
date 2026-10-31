/**
 * Serialisation des entites exposees par l'API.
 *
 * Objectif : ne jamais renvoyer de donnee sensible (hash de mot de passe)
 * au client, quel que soit le controleur qui les expose.
 */

/**
 * Retourne un utilisateur (sans hash de mot de passe).
 * @param {object|null} user utilisateur a retourner
 * @returns {object|null}
 */
function serializeUser(user) {
  if (!user) return null;

  const plain = typeof user.get === "function" ? user.get({ plain: true }) : { ...user };

  delete plain.password;

  return plain;
}

/**
 * Retourne une liste d'utilisateur (sans hash de mot de passe).
 * @param {Array<object>} users
 * @returns {Array<object>}
 */
function serializeUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.map(serializeUser);
}

module.exports = { serializeUser, serializeUsers };
