describe('Full Event Management Flow (Create, Edit, Delete)', () => {

    // This hook runs before each test in this file
    beforeEach(() => {
        // 1. INSTEAD of 5 lines of login code...
        //    you just write this ONE line!
        cy.loginAsOrganizer();

        // 2. Go to the dashboard (the login command already lands you here,
        //    but visiting it again is a good way to ensure a clean start)
        cy.visit('/organiser/dashboard');
    });

    it('CEFTS-4 & CEFTS-5: successfully creates, edits, closes, and deletes an event', () => {

        const eventTitle = `E2E Test Event ${Date.now()}`;
        const editedTitle = `${eventTitle} (Edited)`;

        // --- 1. CREATE ---
        cy.contains('Create New Event').click();
        cy.url().should('include', '/organiser/create-event');

        // Fill out the form
        cy.get('input[name="title"]').type(eventTitle);
        cy.get('textarea[name="description"]').type('This is a test description.');
        cy.get('input[name="targetGoal"]').type('1000');
        cy.get('button[type="submit"]').click();

        // Assert: We are back on the dashboard and the event exists
        cy.url().should('include', '/organiser/dashboard');
        cy.contains(eventTitle).should('be.visible');

        // --- 2. EDIT ---
        // Find the event card, then find the "Edit" link within that card
        cy.contains('h3', eventTitle)
            .parents('.card') // Find the parent card element
            .find('a[href*="/organiser/event/edit/"]') // Find the edit link
            .click();

        cy.url().should('include', '/organiser/event/edit');
        cy.get('input[name="title"]').clear().type(editedTitle);
        cy.get('button[type="submit"]').click();

        // Assert: Back on dashboard, title is updated
        cy.url().should('include', '/organiser/dashboard');
        cy.contains(editedTitle).should('be.visible');

        // --- 3. CLOSE ---
        cy.contains('h3', editedTitle)
            .parents('.card')
            .find('button') // Find the first button (should be Close)
            .contains('Close Event')
            .click();

        // Assert: Status text is updated (this assumes you have <p>Status: Closed</p>)
        cy.contains('h3', editedTitle)
            .parents('.card')
            .contains('Status: Closed')
            .should('be.visible');

        // --- 4. DELETE ---
        cy.contains('h3', editedTitle)
            .parents('.card')
            .find('button')
            .contains('Delete')
            .click();

        // Assert: The event is now gone
        cy.contains(editedTitle).should('not.exist');
    });
});