const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // This is the URL of your frontend dev server
    baseUrl: 'http://localhost:3000',
    
    // --- THIS IS THE FIX ---
    // This tells Cypress where your test files are
    specPattern: 'tests/system/cypress/e2e/**/*.cy.js',
    // -----------------------
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});