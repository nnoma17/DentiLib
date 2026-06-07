require('cypress-xpath');

describe('page acceuil', () => {
  beforeEach( () => {
    cy.visit("http://localhost:3000");

    cy.get('#email').type('email@gmail.com');
    cy.get('#password').type('12345678');
    cy.xpath('//button[text()="Se connecter"]').click();
    
    cy.url().should('include', '/admin/dashboard_admin.html');
  });

  it('Vérifie le filtre par rôle', () => {
    cy.get('#professional-value').select('DENTISTE');
    cy.get('#userTableBody tr').each($tr => {
      cy.wrap($tr).find('td:nth-child(4)').should('contain', 'DENTISTE');
    });
  });

  it('Crée un dentiste et vérifie qu il est visible dans le tableau', () => {
    cy.get('#createUser').click();

    cy.get('#lastName').type('Ndentiste');
    cy.get('#firstName').type('Pdentiste');
    cy.get('#email').type(`n.p${Date.now()}@test.com`);
    cy.get('#role').select('DENTISTE');
    cy.get('#password').type('MotDePasse123');

    cy.get('#btnCreate').click();
    cy.get('#close-modal-createUser').click();

    cy.xpath("(//tbody[@id='userTableBody']//tr)[last()]").contains('td', 'Ndentiste').should('exist');
    cy.xpath("(//tbody[@id='userTableBody']//tr)[last()]").contains('td', 'Pdentiste').should('exist');
  });

  it('Affiche une erreur si un champ obligatoire est vide', () => {
    cy.get('#createUser').click();
    cy.get('#btnCreate').click();
    cy.get('#errorMessage').should('be.visible').and('contain.text', 'Champs manquants');
  });

});