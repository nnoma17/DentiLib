describe('page acceuil', () => {
  beforeEach(function () {
    cy.fixture('users').then((users) => {
      cy.login(users.admin.email, users.admin.password);
      cy.url({ timeout: 10000 }).should('include', '/admin/dashboard_admin.html');
    });
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

    cy.get('#userTableBody').contains('td', 'Ndentiste').should('exist');
    cy.get('#userTableBody').contains('td', 'Pdentiste').should('exist');
  });

  it('Affiche une erreur si un champ obligatoire est vide', () => {
    cy.get('#createUser').click();
    cy.get('#btnCreate').click();
    cy.get('#errorMessage').should('be.visible').and('contain.text', 'Champs manquants');
  });

});