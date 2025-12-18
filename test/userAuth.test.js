const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../models/user.model")
const { jwtDecode } = require("jwt-decode");

const serverURL = "http://localhost:3000";
let token;
let idUserAdmin;

beforeAll(async () => {
    const res = await request(serverURL)
        .post("/api/user/login_User")
        .send({
            email: "admin@email.fr",
            password: "12345678"
        });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
    idUserAdmin = jwtDecode(token).id;
});



describe("POST -create Admin", () => {

    //Test : création d'un admin valide
    it("Création d'un nouveau admin", async () => {
        const res = await request(serverURL).post("/api/admin/create_Admin").send({
            lastName: "lastNameAdmin",
            firstName: "firstNameAdmin",
            email: "admin@email.fr",
            password: "12345678"
        })

        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe("admin@email.fr");
    })

    it("Création d'un admin avec un email déjà utilisé", async () => {
        const res = await request(serverURL).post("/api/admin/create_Admin").send({
            lastName: "lastNameAdmin",
            firstName: "firstNameAdmin",
            email: "admin@email.fr",
            password: "12345678"
        })

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("Email déjà utilisé.");
    })

    it("Création d'un admin avec un email invalide", async () => {
        const res = await request(serverURL).post("/api/admin/create_Admin").send({
            lastName: "lastNameAdmin",
            firstName: "firstNameAdmin",
            email: "admin@",
            password: "12345678"
        })

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Le format de l'email est incorrect.");
    })

    it("Création d'un admin avec un email invalide", async () => {
        const res = await request(serverURL).post("/api/admin/create_Admin").send({
            lastName: "lastNameAdmin",
            firstName: "firstNameAdmin",
            email: "admi@mail.fr",
            password: "123"
        })

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Le mot de passe doit contenir au moins 6 caractères.");
    })
})

describe("POST -create Admin", () => {

    it("devrait connecter un admin avec des identifiants valides", async () => {
        const res = await request(serverURL)
            .post("/api/user/login_User")
            .send({
                email: "admin@email.fr",
                password: "12345678"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
        //Met l'id de l'user connecté dans la variable globale pour les prochains tests
        idUserAdmin = jwtDecode(token).id;
        expect(res.body.role).toBe("ADMIN");
    });

    it("devrait connecter un admin avec mot de passe invalide", async () => {
        const res = await request(serverURL)
            .post("/api/user/login_User")
            .send({
                email: "admin@email.fr",
                password: "87654321"
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("mot de passe incorrect");
    });

    it("devrait connecter un admin sans email", async () => {
        const res = await request(serverURL)
            .post("/api/user/login_User")
            .send({
                password: "87654321"
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("L'utilisateur n'existe pas");
    });
})




describe("DELETE - delete actual user", () => {
    it("devrait supprimer l'utilisateur actuel", async () => {
        const res = await request(serverURL)
            .delete("/api/user/delete_actual_user")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("User deleted successfully.");
    });

    it("devrait supprimer l'utilisateur actuel", async () => {
        const res = await request(serverURL)
            .delete("/api/user/delete_actual_user");

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("token no trouvé ou invalide");
    });
});