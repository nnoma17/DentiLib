require('cypress-xpath');

describe('page acceuil', () => {
  beforeEach( () => {
    cy.visit("http://localhost:3000");

    cy.get('#email').type('email@gmail.com');
    cy.get('#password').type('12345678');
    cy.xpath('//button[text()="Se connecter"]').click();
    
    cy.url().should('include', '/admin/dashboard_admin.html');
  });

});