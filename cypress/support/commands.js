require('cypress-xpath');

Cypress.Commands.add('login', (email, password) => {
  cy.visit("http://localhost:3000");
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.xpath('//button[text()="Se connecter"]').click();
});