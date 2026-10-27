describe("Création fiche", () => {

  beforeEach(function () {
    cy.fixture("creationFiche").then((fixture) => {
      this.data = fixture;
    });

    cy.fixture("users").then((users) => {
      this.users = users;
      cy.login(users.dentiste.email, users.dentiste.password);
    });

    cy.url({ timeout: 10000 }).should('include', '/dentiste/dashboard_dentiste.html');
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

    cy.xpath(`//tr[descendant::td[contains(text(),'${this.data.patient.acteName}')]]//input`).click();
    cy.get("#createWorksheet").click();
    cy.url({ timeout: 10000 }).should("include", "dashboard_dentiste");

    // --------------------------
    // 2. Détail
    // --------------------------
    cy.get("#worksheetTableBody tr")
      .contains(this.data.patient.firstName)
      .parent()
      .contains("Détail")
      .click();
    cy.url({ timeout: 10000 }).should("include", "worksheet_detail");

    // --------------------------
    // 3. Valider et envoyer
    // --------------------------
    cy.get("#worksheetTableBody input[type='checkbox']:checked").should("exist");
    cy.get("#firstNamePatient").should("not.have.value", "");
    cy.get("#validationWorksheet").click();
    cy.url({ timeout: 10000 }).should("include", "dashboard_dentiste");

    // --------------------------
    // 4. Déconnexion dentiste
    // --------------------------
    cy.get("#disconnect").click();
    cy.url({ timeout: 10000 }).should("include", "login");

    // --------------------------
    // 5. Login prothésiste
    // --------------------------
    cy.login(this.users.prothesiste.email, this.users.prothesiste.password);
    cy.url({ timeout: 10000 }).should('include', '/prothesiste/dashboard_prothesiste.html');

    // --------------------------
    // 6. Vérification fiche
    // --------------------------
    cy.get("#worksheetTableBody")
      .should("contain", this.data.patient.firstName)
      .and("contain", this.data.patient.lastName)
      .and("contain", this.data.patient.email);
  });

});