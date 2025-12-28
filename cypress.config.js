const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: "tests/e2e/**/*.cy.js",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
