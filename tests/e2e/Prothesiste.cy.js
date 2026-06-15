describe("Prothésiste - Vérification du tableau (lecture seule)", () => {

  beforeEach(function () {
    cy.fixture("users").then((users) => {
      cy.login(users.prothesiste.email, users.prothesiste.password);
    });

    cy.url({ timeout: 10000 }).should('include', '/prothesiste/dashboard_prothesiste.html');
  });


  it("Vérifie l'affichage complet des worksheets", () => {

    cy.get("#worksheetTableBody tr")
      .should("have.length.greaterThan", 0)
      .first()
      .within(() => {

        // Numéro de fiche
        cy.get("td").eq(0)
          .should("not.be.empty");

        // Nom patient
        cy.get("td").eq(1)
          .should("not.be.empty");

        // Email patient
        cy.get("td").eq(2)
          .should("contain", "@");

        // Numéro sécurité sociale
        cy.get("td").eq(3)
          .invoke("text")
          .should("match", /^\d+$/);

        // Statut
        cy.get("td").eq(4)
          .should("not.be.empty");
      });
  });
});