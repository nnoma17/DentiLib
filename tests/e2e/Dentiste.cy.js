require('cypress-xpath');

describe("Dentiste - Création d'une fiche patient", () => {

  beforeEach( () => {
    cy.visit("http://localhost:3000");

    cy.get('#email').type('dentiste@email.fr');
    cy.get('#password').type('12345678');
    cy.xpath('//button[text()="Se connecter"]').click();
    
    cy.url().should('include', '/dentiste/dashboard_dentiste.html');
  });

    it("Créer une fiche et vérifier le détail dans le dashboard", () => {
        cy.get("#createWorksheet").click();

        cy.url().should("include", "worksheet");

        cy.get("#firstNamePatient").type("Ppatient");
        cy.get("#lastNamePatient").type("Npatient");
        cy.get("#emailNamePatient").type("p.n@test.com");
        cy.get("#numSecuPatient").type("1234567890123");
        cy.get("#commentProcedure").type("Test automatisé Cypress");

        cy.get("button[type='submit']").click();

        cy.url().should("include", "dashboard_dentiste");

        cy.get("#worksheetTableBody")
            .should("contain", "Ppatient")
            .and("contain", "Npatient")
            .and("contain", "p.n@test.com");

        cy.get("#worksheetTableBody tr")
            .contains("Ppatient")
            .click();

        cy.get("#detailFirstName").should("have.text", "Ppatient");
        cy.get("#detailLastName").should("have.text", "Npatient");
        cy.get("#detailEmail").should("have.text", "p.n@test.com");
        cy.get("#detailNumSecu").should("have.text", "1234567890123");
        cy.get("#detailComment").should("have.text", "Test automatisé Cypress");

    });


   it("Créer une fiche et ne pas mettre de mail", () => {
    cy.get("#createWorksheet").click();

    cy.url().should("include", "worksheet");

    cy.get("#firstNamePatient").type("Ppatient");
    cy.get("#lastNamePatient").type("Npatient");
    cy.get("#numSecuPatient").type("1234567890123");
    cy.get("#commentProcedure").type("Test automatisé Cypress");

    cy.xpath("//button[text()='Créer la fiche']").click();
    cy.get('#errorForm').should('be.visible').and('contain', 'Veuillez remplir tous les champs obligatoires');
  });

   it("Créer une fiche et mettre un numero de securite social avec des chiffres", () => {
    cy.get("#createWorksheet").click();

    cy.url().should("include", "worksheet");

    cy.get("#firstNamePatient").type("Ppatient");
    cy.get("#lastNamePatient").type("Npatient");
    cy.get("#emailNamePatient").type("p.n@test.com");
    cy.get("#numSecuPatient").type("abc");
    cy.get("#commentProcedure").type("Test automatisé Cypress");

    cy.xpath("//button[text()='Créer la fiche']").click();
    cy.get('#errorForm').should('be.visible').and('contain', 'Le numéro de sécurité sociale doit contenir uniquement des chiffres');
  });
});