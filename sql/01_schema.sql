CREATE TABLE Utilisateur ( 
    idUser INT PRIMARY KEY AUTO_INCREMENT, 
    lastName VARCHAR(100) NOT NULL, 
    firstName VARCHAR(100) NOT NULL, 
    email VARCHAR(150) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL, 
    role ENUM('DENTISTE', 'PROTHESISTE', 'ADMIN') NOT NULL, 
    siret VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 

CREATE TABLE Acte ( 
    idProcedure INT PRIMARY KEY AUTO_INCREMENT, 
    name VARCHAR(150) NOT NULL, 
    description TEXT 
);

CREATE TABLE FicheTravaux ( 
    idWorkSheet INT PRIMARY KEY AUTO_INCREMENT, 
    numWorkSheet INT NOT NULL, 
    status ENUM('A valider','En attente','En cours','Termine') NOT NULL, 
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    comment TEXT, 
    lastNamePatient VARCHAR(100) NOT NULL, 
    firstNamePatient VARCHAR(100) NOT NULL, 
    emailNamePatient VARCHAR(150), 
    numSecuPatient VARCHAR(15), 
    idDentist INT NOT NULL, 
    idProthesiste INT NOT NULL, 
    FOREIGN KEY (idDentist) REFERENCES Utilisateur(idUser), 
    FOREIGN KEY (idProthesiste) REFERENCES Utilisateur(idUser) 
); 

CREATE TABLE FicheTravauxActe (
    idWorkSheet INT NOT NULL,
    idProcedure INT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    description TEXT,

    PRIMARY KEY (idWorkSheet, idProcedure),

    FOREIGN KEY (idWorkSheet) REFERENCES FicheTravaux(idWorkSheet),
    FOREIGN KEY (idProcedure) REFERENCES Acte(idProcedure)
);

CREATE TABLE CatalogueProthesiste ( 
    idProthesiste INT NOT NULL, 
    idProcedure INT NOT NULL, 
    price DECIMAL(10,2) NOT NULL CHECK (price > 0), 
    PRIMARY KEY (idProthesiste, idProcedure), 
    FOREIGN KEY (idProthesiste) REFERENCES Utilisateur(idUser), 
    FOREIGN KEY (idProcedure) REFERENCES Acte(idProcedure) 
);

CREATE TABLE Log (
  idLog INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_id INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Utilisateur(idUser)
);