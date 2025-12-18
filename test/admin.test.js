const request = require("supertest");
const mongoose = require("mongoose");
const { jwtDecode } = require("jwt-decode");

const serverURL = "http://localhost:3000";
let token;
let idUserAdmin;
let idUserProthesite;

beforeAll(async () => { //Il faut
    const res = await request(serverURL)
        .post("/api/user/login_User")
        .send({
            email: "email2@gmail.com",
            password: "12345678"
        });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
});


describe("PUT - update user", () => {

    it("Mettre à jour un utilisateur avec un email déjà utilisé", async () => {
        //Utiliser l'email de l'utilisateur créé précédemment
        const res = await request(serverURL)
            .put("/api/admin/update_User/" + new mongoose.Types.ObjectId(idUserAdmin))
            .set("Authorization", `Bearer ${token}`)
            .send({
                email: "email@gmail.com"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Cet email est déjà utilisé");
    })

    it("Mettre à jour un utilisateur valide", async () => {
        //Utiliser l'email de l'utilisateur créé précédemment
        const res = await request(serverURL)
            .put("/api/admin/update_User/" + new mongoose.Types.ObjectId(idUserAdmin))
            .set("Authorization", `Bearer ${token}`)
            .send({
                lastName: "newlastNameAdmin",
                firstName: "newfirstNameAdmin",
                email: "newadmin@email.fr",
                password: "new12345678"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.user.lastName).toBe("newlastNameAdmin");
        expect(res.body.user.firstName).toBe("newfirstNameAdmin");
        expect(res.body.user.email).toBe("newadmin@email.fr");
    })
})


describe("Create users", () => {
    let idUserDentiste;
    it("Créer un nouveau dentiste", async () => {
        const res = await request(serverURL)
            .post("/api/admin/create_Account")
            .set("Authorization", `Bearer ${token}`)
            .send({
                lastName: "lastNameDentiste",
                firstName: "firstNameDentiste",
                email: "dentiste@email.fr",
                password: "12345678",
                role: "DENTISTE",
                siret: "12345678901234"
            })

        idUserDentiste = res.body.user._id;
        expect(res.statusCode).toBe(201);
        expect(res.body.user.lastName).toBe("lastNameDentiste");        
    })
/*
    it("Créer un nouveau prothesiste", async () => {
        const res = await request(serverURL)
            .post("/api/admin/create_Account")
            .set("Authorization", `Bearer ${token}`)
            .send({
                lastName: "lastNameProthesiste",
                firstName: "firstNameProthesiste",
                email: "prothesiste@email.fr",
                password: "12345678",
                role: "PROTHESISTE",
                siret: "12345678901234",
                dentisteId: idUserDentiste
            })

        idUserProthesite = res.body.user._id;
        expect(res.statusCode).toBe(201);
        expect(res.body.user.lastName).toBe("lastNameDentiste");        
    })*/

    it("Supprimer un utilisateur", async () => {
        const res = await request(serverURL)
            .delete("/api/admin/delete_User/" + new mongoose.Types.ObjectId(idUserProthesite))
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Utilisateur supprimé");
    })

    it("Supprimer un utilisateur qui n'existe pas", async () => {
        const res = await request(serverURL)
            .delete("/api/admin/delete_User/" + new mongoose.Types.ObjectId("69440c8b082a879088f10139"))
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Utilisateur non trouvé");
    })
})