/**
 * Middlewares de securite applicatifs (sans dependance externe).
 *
 * Objectifs RNCP couverts ici :
 * - "Securiser l'application contre les principales vulnerabilites"
 *   (OWASP A07 - Security Misconfiguration).
 * - Limitation des tentatives de connexion (force brute, OWASP A02).
 *
 * Ces middlewares sont volontairement ecrits avec les seules APIs natives de
 * Node.js/Express afin de ne pas introduire de dependance supplementaire.
 */

/**
 * En-tetes de securite HTTP (OWASP A06 - Security Misconfiguration).
 *
 * - Content-Security-Policy : interdit l'execution de scripts inline et
 *   limite les sources externes -> bloque les injections de scripts (XSS).
 * - X-Content-Type-Options : interdit le MIME sniffing.
 * - X-Frame-Options : bloque le clickjacking.
 * - Referrer-Policy : ne divulgue pas l'URL des pages internes.
 * - Strict-Transport-Security : impose HTTPS quand l'application est servie
 *   en production (derriere un reverse proxy).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const securityHeaders = (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'"
    ].join("; ")
  );

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
};

/**
 * Limitation de debit en memoire (rate limiting).
 *
 * Implementation maison d'un algorithme "fixed window" : une fenetre glissante
 * de `windowMs` millisecondes, au maximum `max` requetes par cle.
 *
 * La cle par defaut est l'adresse IP du client, ce qui protege les routes
 * sensibles (connexion, creation de compte) contre la force brute.
 *
 * @param {{windowMs?: number, max?: number, message?: string, keyGenerator?: Function}} [options]
 * @returns {import('express').RequestHandler}
 */
const rateLimit = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Trop de requêtes, veuillez réessayer plus tard.",
  keyGenerator
} = {}) => {
  // Map : cle -> { count, resetAt }
  const store = new Map();

  // Nettoyage periodique des cles expirees pour eviter une fuite memoire.
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, windowMs);

  // Ne bloque pas la sortie du processus (sous-tests Jest, etc.).
  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }

  const defaultKeyGenerator = (req) => req.ip || req.socket?.remoteAddress || "unknown";

  return (req, res, next) => {
    const key = (keyGenerator || defaultKeyGenerator)(req);
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));

      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
};

module.exports = { securityHeaders, rateLimit };
