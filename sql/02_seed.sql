--   node -e "console.log(require('bcrypt').hashSync('UnMotDePasseSolide1', 10))"

SET @hash = '$2b$10$NUQbav1KWzf5e3DhP.qVju7rihnQOesDqXnbMmYoCklKTwnCRHup6';

-- 1. Utilisateurs : 1 admin, 1 dentiste, 1 prothésiste
INSERT INTO Utilisateur (idUser, lastName, firstName, email, password, role, siret) VALUES
(1, 'Admin', 'Jean', 'admin@email.fr', @hash, 'ADMIN', NULL),
(2, 'Martin', 'Claire', 'dentiste@email.fr', @hash, 'DENTISTE', '12345678900011'),
(3, 'Durand', 'Paul', 'prothesiste@email.fr', @hash, 'PROTHESISTE', '98765432100022');

-- 2. Liaison dentiste <-> prothésiste (dans les deux sens, comme createUser)
UPDATE Utilisateur SET associatedUser = 3 WHERE idUser = 2;
UPDATE Utilisateur SET associatedUser = 2 WHERE idUser = 3;

-- 3. Actes
INSERT INTO Acte (idProcedure, name, description) VALUES
(1, 'Couronne céramique', 'Couronne en céramique'),
(2, 'Bridge',  'Bridge');

-- Catalogue du prothésiste
INSERT INTO CatalogueProthesiste (idProthesiste, idProcedure, price) VALUES
(3, 1, 180.00),
(3, 2, 450.00);

-- Fiche de travaux créée par le dentiste, confiée au prothésiste
INSERT INTO FicheTravaux
(idWorkSheet, numWorkSheet, status, comment, lastNamePatient, firstNamePatient, emailNamePatient, numSecuPatient, idDentist, idProthesiste) VALUES
(1, 1761700000000, 'En attente', 'Rien a signalé', 'Duval', 'Jean', 'jean.duval@example.com', '123456789012345', 2, 3);

-- 6. Actes de la fiche (prix repris du catalogue)
INSERT INTO FicheTravauxActe (idWorkSheet, idProcedure, price, description) VALUES
(1, 1, 180.00, 'Couronne céramique');