-- ============================================================
--  DentiLib — Jeu d'essai (données de test)
--  CP7 — Données cohérentes pour la base de test
-- ============================================================
--  ⚠️  À exécuter UNIQUEMENT sur la base de TEST
--  Les mots de passe sont des hash bcrypt du mot "Test1234!"
-- ============================================================

BEGIN;

-- ============================================================
--  NETTOYAGE (ordre inverse des FK pour éviter les erreurs)
-- ============================================================
TRUNCATE TABLE catalogue_actes RESTART IDENTITY CASCADE;
TRUNCATE TABLE worksheets      RESTART IDENTITY CASCADE;
TRUNCATE TABLE procedures      RESTART IDENTITY CASCADE;
TRUNCATE TABLE users           RESTART IDENTITY CASCADE;

-- ============================================================
--  USERS
-- ============================================================
-- Hash bcrypt de "Test1234!" généré avec bcrypt(10 rounds)
-- $2b$10$... = hash valide utilisable avec bcrypt.compare()

INSERT INTO users (first_name, last_name, email, password, role, siret) VALUES
(
    'Sophie',
    'Martin',
    'admin@dentilib.fr',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNugQ8ZFi', -- Test1234!
    'ADMIN',
    NULL
),
(
    'Jean',
    'Dupont',
    'dentiste@dentilib.fr',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNugQ8ZFi',
    'DENTISTE',
    12345678901234
),
(
    'Marie',
    'Leblanc',
    'prothesiste@dentilib.fr',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNugQ8ZFi',
    'PROTHESISTE',
    98765432109876
),
(
    'Paul',
    'Bernard',
    'dentiste2@dentilib.fr',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNugQ8ZFi',
    'DENTISTE',
    11122233344455
),
(
    'Clara',
    'Fontaine',
    'prothesiste2@dentilib.fr',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVNugQ8ZFi',
    'PROTHESISTE',
    55544433322211
);

-- Association dentiste ↔ prothésiste
-- Jean Dupont (id=2) ↔ Marie Leblanc (id=3)
UPDATE users SET associated_user_id = 3 WHERE id = 2;
UPDATE users SET associated_user_id = 2 WHERE id = 3;

-- Paul Bernard (id=4) ↔ Clara Fontaine (id=5)
UPDATE users SET associated_user_id = 5 WHERE id = 4;
UPDATE users SET associated_user_id = 4 WHERE id = 5;

-- ============================================================
--  PROCEDURES
-- ============================================================
INSERT INTO procedures (name, description) VALUES
('Couronne céramique',       'Prothèse fixe couvrant l''intégralité de la dent, en céramique pure'),
('Bridge 3 éléments',        'Pont fixe sur 3 unités pour remplacer une dent manquante'),
('Inlay/Onlay résine',       'Restauration indirecte collée, alternative à l''amalgame'),
('Implant unitaire',         'Remplacement d''une dent par un implant vissé dans l''os'),
('Prothèse amovible totale', 'Dentier complet pour arcade entière, résine ou métal'),
('Gouttière occlusale',      'Dispositif de protection contre le bruxisme nocturne');

-- ============================================================
--  CATALOGUE ACTES (prix prothésistes)
-- ============================================================
-- Marie Leblanc (id=3) fixe ses prix
INSERT INTO catalogue_actes (prothesiste_id, procedure_id, price) VALUES
(3, 1, 450.00),   -- Couronne céramique
(3, 2, 890.00),   -- Bridge 3 éléments
(3, 3, 180.00),   -- Inlay/Onlay résine
(3, 6, 95.00);    -- Gouttière occlusale

-- Clara Fontaine (id=5) fixe ses prix
INSERT INTO catalogue_actes (prothesiste_id, procedure_id, price) VALUES
(5, 1, 420.00),   -- Couronne céramique
(5, 2, 850.00),   -- Bridge 3 éléments
(5, 4, 1200.00),  -- Implant unitaire
(5, 5, 650.00);   -- Prothèse amovible totale

-- ============================================================
--  WORKSHEETS
-- ============================================================
INSERT INTO worksheets (
    num_worksheet, status, comment,
    first_name_patient, last_name_patient, email_patient, num_secu_patient,
    id_dentist, procedure_id
) VALUES
(
    'WS-2024-001', 'En cours',
    'Patient anxieux, prévoir anesthésie renforcée',
    'Alice', 'Moreau', 'alice.moreau@email.fr', '2850175012345',
    2, 1
),
(
    'WS-2024-002', 'Terminé',
    NULL,
    'Robert', 'Petit', 'robert.petit@email.fr', '1720169087654',
    2, 2
),
(
    'WS-2024-003', 'A valider',
    'Vérifier le teinte avec le patient avant fabrication',
    'Emma', 'Simon', 'emma.simon@email.fr', '2920375098765',
    2, 1
),
(
    'WS-2024-004', 'En cours',
    NULL,
    'Lucas', 'Laurent', 'lucas.laurent@email.fr', '1850269011122',
    4, 4
),
(
    'WS-2024-005', 'Annulé',
    'Patient a changé d''avis, remboursement effectué',
    'Nadia', 'Rousseau', 'nadia.rousseau@email.fr', '2761275033344',
    4, 5
),
(
    'WS-2024-006', 'A valider',
    NULL,
    'Thomas', 'Michel', 'thomas.michel@email.fr', '1930369055566',
    2, 3
);

COMMIT;

-- ============================================================
--  VÉRIFICATION
-- ============================================================
SELECT 'users'           AS table_name, COUNT(*) AS nb_lignes FROM users
UNION ALL
SELECT 'procedures',      COUNT(*) FROM procedures
UNION ALL
SELECT 'catalogue_actes', COUNT(*) FROM catalogue_actes
UNION ALL
SELECT 'worksheets',      COUNT(*) FROM worksheets;