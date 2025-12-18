const request = require("supertest");

const serverURL = "http://localhost:3000";
let token;

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

describe("POST - Create procedure", () => {
    it("Créer une nouvelle procédure", async () => {
        const res = await request(serverURL)
            .post("/api/admin/gestionProcedure/create_Procedure")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Procédure Test",
                description: "Description de la procédure test"
            });
            
        expect(res.statusCode).toBe(201);
        expect(res.body.procedure.name).toBe("Procédure Test");
        expect(res.body.procedure.description).toBe("Description de la procédure test");
    })
    
    it("Créer une nouvelle procédure qui existe déjà", async () => {
        const res = await request(serverURL)
            .post("/api/admin/gestionProcedure/create_Procedure")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Procédure Test",
                description: "Description de la procédure test"
            });
            
        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("Un acte avec ce nom existe déjà");
    })
})