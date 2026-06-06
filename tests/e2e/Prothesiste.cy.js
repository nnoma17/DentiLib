require('cypress-xpath');

describe("Prothesiste", () => {

  beforeEach( () => {
    cy.visit("http://localhost:3000");

    cy.get('#email').type('prothesiste@email.fr');
    cy.get('#password').type('12345678');
    cy.xpath('//button[text()="Se connecter"]').click();
    
    cy.url().should('include', '/prothesiste/dashboard_prothesiste.html');
  });

  it("La fiche testProth est présente dans le tableau", () => {
    
    cy.get("#worksheetTableBody")
      .should("contain", "Patient testProth")
      .and("contain", "nom")
      .and("contain", "testprothesiste@mail.fr")
      .and("contain", "321654987");
  });

  it("On peut accéder au détail de la fiche", () => {
    //tr[descendant::td[text()='Patient testProth']]
    cy.xpath("//tr[descendant::td[text()='Patient testProth nom']]//button[contains(text(),'Détail')]")
      .click();

    cy.get("#detailFirstName").should("have.text", "Patient testProth");
    cy.get("#detailLastName").should("have.text", "nom");
    cy.get("#detailEmail").should("have.text", "testprothesiste@mail.fr");
    cy.get("#detailNumSecu").should("have.text", "321654987");
    cy.get("#detailComment").should("have.text", "remarque");
  });


});