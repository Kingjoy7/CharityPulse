describe('Organizer Login Flow', () => {
  it('CEFTS-15: should allow an organizer to log in and redirect to dashboard', () => {
    // 1. Visit the login page
    cy.visit('/login');

    // 2. Get form elements and type credentials
    // Note: You must have a user in your test DB with these credentials
    cy.get('label[for="email"]').next('input').type('organizer@test.com');
    cy.get('label[for="password"]').next('input').type('password123');

    // 3. Click the login button
    cy.get('button[type="submit"]').click();

    // 4. Verify redirect to the dashboard
    cy.url().should('include', '/dashboard');

    // 5. Verify dashboard content
    cy.get('h1').should('contain.text', 'Organizer Dashboard');
  });

  it('CEFTS-15: should show an error on failed login', () => {
    // 1. Visit the login page
    cy.visit('/login');

    // 2. Type incorrect credentials
    cy.get('label[for="email"]').next('input').type('organizer@test.com');
    cy.get('label[for="password"]').next('input').type('wrongpassword');

    // 3. Click the login button
    cy.get('button[type="submit"]').click();

    // 4. Verify error message is visible
    cy.get('p[style*="color: red"]').should('contain.text', 'Invalid credentials');

    // 5. Verify we are still on the /login page
    cy.url().should('include', '/login');
  });
});