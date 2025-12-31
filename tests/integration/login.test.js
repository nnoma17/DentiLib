const request = require("supertest");
const app = require("../../app");
const dbConnection = require("../../config/dbConfig");

beforeAll(async () => {
    await dbConnection();
});

describe("POST /api/user/login_User", () => {

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