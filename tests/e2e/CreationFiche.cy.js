require('cypress-xpath');

describe("Création fiche", () => {

  beforeEach(function () {

    cy.fixture("creationFiche").then((fixture) => {
      this.data = fixture;
    });

    cy.visit("http://localhost:3000");

    cy.get('#email').type('dentiste@email.fr');
    cy.get('#password').type('12345678');
    cy.xpath('//button[text()="Se connecter"]').click();

    cy.url().should('include', '/dentiste/dashboard_dentiste.html');
  });

  it("Création fiche complète + validation + vérification prothésiste", function () {

    // --------------------------
    // 1. Création fiche
    // --------------------------
    cy.get("#createWorksheet").click();

    cy.get("#firstNamePatient").type(this.data.patient.firstName);
    cy.get("#lastNamePatient").type(this.data.patient.lastName);
    cy.get("#emailNamePatient").type(this.data.patient.email);
    cy.get("#numSecuPatient").type(this.data.patient.numSecu);
    cy.get("#commentProcedure").type(this.data.patient.comment);

    cy.xpath("//tr[descendant::td[contains(text(),'TestAuto-Acte 1')]]//input")
      .click();

    cy.get("#createWorksheet").click();

    cy.url().should("include", "dashboard_dentiste");

    // --------------------------
    // 2. Détail
    // --------------------------
    cy.get("#worksheetTableBody tr")
      .contains(this.data.patient.firstName)
      .parent()
      .contains("Détail")
      .click();

    cy.url().should("include", "worksheet_detail");

    // --------------------------
    // 3. Valider et envoyer
    // --------------------------
    cy.get("#validationWorksheet").click();

    cy.url().should("include", "dashboard_dentiste");

    // --------------------------
    // 4. Déconnexion dentiste
    // --------------------------
    cy.get("#disconnect").click();

    cy.url().should("include", "login");

    // --------------------------
    // 5. Login prothésiste
    // --------------------------
    cy.get('#email').type(this.data.prothesiste.email);
    cy.get('#password').type(this.data.prothesiste.password);
    cy.xpath('//button[text()="Se connecter"]').click();

    cy.url().should('include', '/prothesiste/dashboard_prothesiste.html');

    // --------------------------
    // 6. Vérification fiche
    // --------------------------
    cy.get("#worksheetTableBody")
      .should("contain", this.data.patient.firstName)
      .and("contain", this.data.patient.lastName)
      .and("contain", this.data.patient.email);
  });

});