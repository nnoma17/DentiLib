require('cypress-xpath');

describe('page acceuil', () => {
  beforeEach( () => {
    cy.visit("http://localhost:3000");
  });

  it('Connexion OK', () => {
    cy.get('#email').type('email@gmail.com');
    cy.get('#password').type('12345678');
    cy.xpath('//button[text()="Se connecter"]').click();
    //une erreur s'affiche
    cy.url().should('include', '/admin/dashboard_admin.html');
  })

  it('Connexion avec mauvais mot de passe', () => {
    cy.get('#email').type('email@gmail.com');
    cy.get('#password').type('mauvaisMDP');
    cy.xpath('//button[text()="Se connecter"]').click();
    //une erreur s'affiche
    cy.get('#errorLogin').should('be.visible').and('contain', 'Mot de passe incorrect');
  });

  it('Connexion avec mauvais email', () => {
    cy.get('#email').type('fauxemail@gmail.com');
    cy.get('#password').type('mauvaisMDP');
    cy.xpath('//button[text()="Se connecter"]').click();
    //une erreur s'affiche
    cy.get('#errorLogin').should('be.visible').and('contain', "L'utilisateur n'existe pas");
  });
  
  it('Connexion sans email', () => {
    cy.get('#password').type('mauvaisMDP');
    cy.xpath('//button[text()="Se connecter"]').click();
    //une erreur s'affiche
    cy.get('#errorLogin').should('be.visible').and('contain', "Veuillez remplir tous les champs");
  });

  it("Test envoi d'une requete sans mail",() => {
    cy.intercept('POST', 'http://localhost:3000/api/user/login_User', {
        statusCode: 400,
        body: {
          success: false,
          message: "Champs manquants"
      }
    }).as('loginRequest');

    cy.get('#password').type('mauvaisMDP');
    cy.xpath('//button[text()="Se connecter"]').click();
    cy.get('#errorLogin').should('be.visible').and('contain', "Veuillez remplir tous les champs");

  });
});