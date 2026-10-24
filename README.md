# DentiLib

Application de gestion des fiches de travaux dentaires entre chirurgiens-dentistes et prothésistes.

## Prérequis

- Node.js
- MySQL

## Installation

```bash
git clone https://github.com/nnoma17/DentiLib
cd DentiLib
npm install
```

## Configuration

Créer un fichier `.env` à la racine :
DB_HOST= ...
DB_PORT= ...
DB_NAME= ...
DB_USER= ...
DB_PASSWORD= ...
JWT_SECRET= ...
## Lancer l'application

```bash
node backend/server.js
```

L'application est accessible sur `http://localhost:3000`

## Comptes de test

|      Rôle      |       Email       | Mot de passe |
|----------------|-------------------|--------------|
| Administrateur | admin@email.fr    | 12345678     |
| Dentiste       | dentiste@email.fr | 12345678     |
| Prothésiste    | prothese@email.fr | 12345678     |

## Lancer les tests

```bash
# Tests d'intégration
npm test

# Tests E2E
npx cypress run
```
