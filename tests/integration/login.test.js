const request = require("supertest");
const app = require("../../app");
const dbConnection = require("../../config/dbConfig");
const mongoose = require("mongoose");

beforeAll(async () => {
    await dbConnection();
});

afterAll(async () => {
    await mongoose.connection.close(); // <-- ferme la connexion MongoDB
});

describe("POST /api/user/login_User", () => {
    jest.setTimeout(20000);
    test("login valide", async () => {
        const response = await request(app)
            .post("/api/user/login_User")
            .send({
                email: "email@gmail.com",
                password: "12345678"
            });

        expect(response.statusCode).toBe(200);
    });

    test("email incorrect", async () => {
        const response = await request(app)
            .post("/api/user/login_User")
            .send({
                email: "emailFaux@gmail.com",
                password: "12345678"
            });

        expect(response.statusCode).toBe(404);
    });

    test("mot de passe incorrect", async () => {
        const response = await request(app)
            .post("/api/user/login_User")
            .send({
                email: "email@gmail.com",
                password: "mauvaisMDP"
            });

        expect(response.statusCode).toBe(401);
    });

});