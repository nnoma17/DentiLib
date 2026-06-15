describe("Dentiste - Création d'une fiche patient", () => {

  beforeEach(function () {
    cy.fixture("test1").then((fixture) => {
      this.data = fixture;
    });

    cy.fixture("users").then((users) => {
      cy.login(users.dentiste.email, users.dentiste.password);
    });

    cy.url({ timeout: 10000 }).should('include', '/dentiste/dashboard_dentiste.html');
  });

  it("Créer une fiche et vérifier le détail dans le dashboard", function () {

    cy.get("#createWorksheet").click();
    cy.url({ timeout: 10000 }).should("include", "worksheet");

    cy.get("#firstNamePatient").type(this.data.firstName);
    cy.get("#lastNamePatient").type(this.data.lastName);
    cy.get("#emailNamePatient").type(this.data.email);
    cy.get("#numSecuPatient").type(this.data.numSecu);

    cy.xpath(`//tr[descendant::td[contains(text(),'${this.data.acteName}')]]//input`).click();
    cy.get("#commentProcedure").type(this.data.comment);

    cy.get("#createWorksheet").click();

    cy.url({ timeout: 10000 }).should("include", "dashboard_dentiste");

    cy.get("#worksheetTableBody tr")
      .contains(this.data.firstName)
      .closest("tr")
      .find("td:nth-child(2)").should("have.text", this.data.firstName + " " + this.data.lastName);
      
    cy.get("#worksheetTableBody tr")
      .contains(this.data.firstName)
      .closest("tr")
      .find("td:nth-child(3)").should("have.text", this.data.email);

    cy.get("#worksheetTableBody tr")
      .contains(this.data.firstName)
      .closest("tr")
      .find("td:nth-child(4)").should("have.text", this.data.numSecu);
  });


  it("Créer une fiche et ne pas mettre de mail", function () {

    cy.get("#createWorksheet").click();
    cy.url({ timeout: 10000 }).should("include", "worksheet");

    cy.get("#firstNamePatient").type(this.data.firstName);
    cy.get("#lastNamePatient").type(this.data.lastName);
    cy.get("#numSecuPatient").type(this.data.numSecu);
    cy.get("#commentProcedure").type(this.data.comment);

    cy.xpath("//button[text()='Créer la fiche']").click();

    cy.get('#errorForm')
      .should('be.visible')
      .and('contain', 'Veuillez remplir tous les champs obligatoires');
  });


  it("Créer une fiche et mettre un numéro invalide", function () {

    cy.get("#createWorksheet").click();
    cy.url({ timeout: 10000 }).should("include", "worksheet");

    cy.get("#firstNamePatient").type(this.data.firstName);
    cy.get("#lastNamePatient").type(this.data.lastName);
    cy.get("#emailNamePatient").type(this.data.email);
    cy.get("#numSecuPatient").type("abc");
    cy.get("#commentProcedure").type(this.data.comment);

    cy.xpath("//button[text()='Créer la fiche']").click();

    cy.get('#errorForm')
      .should('be.visible')
      .and('contain', 'Le numéro de sécurité sociale doit contenir uniquement des chiffres');
  });

});