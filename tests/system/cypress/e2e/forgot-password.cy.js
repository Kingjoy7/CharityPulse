describe('Forgot Password Flow', () => {

    it('CEFTS-16: allows a user to request a password reset link', () => {
        // 1. Visit the new role selection page
        cy.visit('/select-login');

        // 2. Click the Organizer button
        cy.contains('Organizer').click();

        // 3. On the login page, click "Forgot Password?"
        cy.contains('Forgot Password?').click();

        // 4. Assert we are on the correct page
        cy.url().should('include', '/forgot-password');

        // 5. Fill out the form (use a user you know exists)
        cy.get('input[id="email"]').type('organizer@test.com');
        cy.get('button[type="submit"]').click();

        // 6. Assert the success message appears
        cy.contains('If an account with this email exists, a reset link has been sent.')
            .should('be.visible');
    });

    // Note: Testing the *full* reset flow (getting the link, using it)
    // is much more advanced. This test proves the "forgot password"
    // form works correctly, which satisfies the story.

});