require('cypress-xpath');

describe("Prothésiste - Vérification du tableau (lecture seule)", () => {

  beforeEach(() => {
    cy.visit("http://localhost:3000");

    cy.get('#email').type('prothesiste@email.fr');
    cy.get('#password').type('12345678');
    cy.xpath('//button[text()="Se connecter"]').click();

    cy.url().should('include', '/prothesiste/dashboard_prothesiste.html');
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