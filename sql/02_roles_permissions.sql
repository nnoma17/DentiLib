-- ============================================================
--  DentiLib — Gestion des droits d'accès PostgreSQL
--  CP7 — Utilisateurs BDD et permissions
-- ============================================================

-- ============================================================
--  CRÉATION DES RÔLES APPLICATIFS
-- ============================================================

-- Rôle applicatif principal (utilisé par l'API Node.js)
-- Droits limités au strict nécessaire (principe du moindre privilège)
CREATE ROLE dentilib_app WITH
    LOGIN
    PASSWORD 'DentiLib_App_2024!'   -- à remplacer par une variable d'environnement
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE;

-- Rôle lecture seule (pour les rapports, audits, monitoring)
CREATE ROLE dentilib_readonly WITH
    LOGIN
    PASSWORD 'DentiLib_Read_2024!'
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE;

-- Rôle administrateur base de données (migrations, maintenance)
-- Ne pas utiliser dans l'application
CREATE ROLE dentilib_admin WITH
    LOGIN
    PASSWORD 'DentiLib_Admin_2024!'
    NOSUPERUSER
    CREATEDB
    NOCREATEROLE;

-- ============================================================
--  PERMISSIONS — dentilib_app (compte utilisé par l'API)
-- ============================================================

-- Accès à la base
GRANT CONNECT ON DATABASE dentilib TO dentilib_app;
GRANT USAGE ON SCHEMA public TO dentilib_app;

-- Séquences (nécessaire pour les SERIAL / auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dentilib_app;

-- Permissions par table — CRUD complet sur les tables métier
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users           TO dentilib_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE procedures      TO dentilib_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE worksheets      TO dentilib_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE catalogue_actes TO dentilib_app;

-- Pour les futures tables créées
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dentilib_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO dentilib_app;

-- ============================================================
--  PERMISSIONS — dentilib_readonly (rapports / monitoring)
-- ============================================================

GRANT CONNECT ON DATABASE dentilib TO dentilib_readonly;
GRANT USAGE ON SCHEMA public TO dentilib_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dentilib_readonly;

-- ⚠️ Pas d'accès en écriture — lecture seule stricte
-- ⚠️ Pas d'accès aux séquences

-- ============================================================
--  PERMISSIONS — dentilib_admin (DBA uniquement)
-- ============================================================

GRANT ALL PRIVILEGES ON DATABASE dentilib TO dentilib_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dentilib_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dentilib_admin;

-- ============================================================
--  RÉVOCATIONS EXPLICITES (sécurité renforcée)
-- ============================================================

-- Retirer les droits par défaut de PUBLIC
REVOKE ALL ON DATABASE dentilib FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Interdire à dentilib_app de modifier la structure
REVOKE CREATE ON SCHEMA public FROM dentilib_app;

-- ============================================================
--  RÉSUMÉ DES DROITS
-- ============================================================
--
--  Rôle              | SELECT | INSERT | UPDATE | DELETE | DDL
--  ------------------|--------|--------|--------|--------|-----
--  dentilib_app      |   ✅   |   ✅   |   ✅   |   ✅   |  ❌
--  dentilib_readonly |   ✅   |   ❌   |   ❌   |   ❌   |  ❌
--  dentilib_admin    |   ✅   |   ✅   |   ✅   |   ✅   |  ✅
--
-- ============================================================