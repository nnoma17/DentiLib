// config/sqlConfig.js
// ============================================================
//  DentiLib — Connexion PostgreSQL (couche SQL parallèle)
//  ⚠️  Ce fichier ne modifie PAS la connexion MongoDB existante
//      (config/dbConfig.js reste inchangé)
// ============================================================

const { Pool } = require('pg');

const pool = new Pool({
    host:     process.env.PG_HOST     || 'localhost',
    port:     parseInt(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE || 'dentilib',
    user:     process.env.PG_USER     || 'dentilib_app',
    password: process.env.PG_PASSWORD,
    max:      10,          // connexions max dans le pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

// Vérification au démarrage
pool.on('connect', () => {
    console.log('[PostgreSQL] Nouvelle connexion établie');
});

pool.on('error', (err) => {
    console.error('[PostgreSQL] Erreur inattendue sur le pool :', err.message);
});

/**
 * Tester la connexion au démarrage du serveur
 */
const connectSQL = async () => {
    try {
        const client = await pool.connect();
        console.log('[PostgreSQL] Connexion réussie');
        client.release();
    } catch (err) {
        console.error('[PostgreSQL] Erreur de connexion :', err.message);
        // On ne bloque pas le démarrage — MongoDB reste opérationnel
    }
};

module.exports = { pool, connectSQL };