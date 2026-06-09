-- ============================================================
--  DentiLib — Script de création de la base PostgreSQL
--  Compatible avec l'existant MongoDB (couche parallèle)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  TABLE : users
--  Correspond au modèle Mongoose User (user.model.js)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL          PRIMARY KEY,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL CHECK (role IN ('ADMIN', 'DENTISTE', 'PROTHESISTE')),
    siret       BIGINT          CHECK (siret > 0),
    associated_user_id INT      REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE : procedures
--  Correspond au modèle Mongoose Procedure (procedure.model.js)
-- ============================================================
CREATE TABLE IF NOT EXISTS procedures (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE : catalogue_actes
--  Correspond à listeActes[] dans le schéma User Mongoose
--  Relation N-N entre prothésiste et procédures avec un prix
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogue_actes (
    id              SERIAL      PRIMARY KEY,
    prothesiste_id  INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    procedure_id    INT         NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (prothesiste_id, procedure_id)   -- un prothésiste ne peut pas avoir deux fois le même acte
);

-- ============================================================
--  TABLE : worksheets
--  Correspond au modèle Mongoose WorkSheet (workSheet.model.js)
-- ============================================================
CREATE TABLE IF NOT EXISTS worksheets (
    id                  SERIAL          PRIMARY KEY,
    num_worksheet       VARCHAR(100)    NOT NULL UNIQUE,
    status              VARCHAR(50)     NOT NULL DEFAULT 'A valider'
                            CHECK (status IN ('A valider', 'En cours', 'Termine')),
    comment             TEXT,
    first_name_patient  VARCHAR(100)    NOT NULL,
    last_name_patient   VARCHAR(100)    NOT NULL,
    email_patient       VARCHAR(255)    NOT NULL,
    num_secu_patient    VARCHAR(15)     NOT NULL,
    invoice_pdf         VARCHAR(500),                             -- chemin ou URL du fichier
    id_dentist          INT             NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    procedure_id        INT             REFERENCES procedures(id) ON DELETE SET NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
--  INDEX — performances sur les recherches fréquentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_worksheets_dentist   ON worksheets(id_dentist);
CREATE INDEX IF NOT EXISTS idx_worksheets_status    ON worksheets(status);
CREATE INDEX IF NOT EXISTS idx_users_role           ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_catalogue_prothesiste ON catalogue_actes(prothesiste_id);

-- ============================================================
--  TRIGGER — mise à jour automatique de updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_procedures_updated_at
    BEFORE UPDATE ON procedures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_worksheets_updated_at
    BEFORE UPDATE ON worksheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_catalogue_updated_at
    BEFORE UPDATE ON catalogue_actes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();