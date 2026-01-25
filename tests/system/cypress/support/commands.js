// This command will log in as an Organizer and cache the session
Cypress.Commands.add('loginAsOrganizer', () => {
    cy.session(
        'organizerSession', // A name for the session
        () => {
            // 1. Visit the new role selection page
            cy.visit('/select-login');
            // 2. Click the Organizer button
            cy.contains('Organizer').click();
            // 3. Assert we are on the login page
            cy.url().should('include', '/login?role=organizer');
            // 4. Log in
            //    (You must register this user first, just once)
            cy.get('input[id="email"]').type('organizer@test.com');
            cy.get('input[id="password"]').type('password123');
            cy.get('button[type="submit"]').click();
            // 5. Assert we are on the Organizer dashboard
            cy.url().should('include', '/organiser/dashboard');
        }
    );
});
// This command logs in, creates an event, and adds 3 pledges to it.
// It returns the ID of the new event.
Cypress.Commands.add('createEventWithPledges', () => {
    // We need the token to make API calls, which cy.session provides
    // This assumes cy.loginAsOrganizer() has already been run and the token is in localStorage
    const token = localStorage.getItem('token');
    const authHeader = `Bearer ${token}`;

    const eventTitle = `Report Test Event ${Date.now()}`;

    // 1. Create a new Event via API
    return cy.request({
        method: 'POST',
        url: 'http://localhost:5001/api/events',
        headers: { 'Authorization': authHeader },
        body: {
            title: eventTitle,
            description: 'Test event for reports',
            targetGoal: 1000,
        },
    }).then((eventRes) => {
        const eventId = eventRes.body._id;

        // 2. Create Pledges for this event via API
        cy.request({
            method: 'POST',
            url: 'http://localhost:5001/api/pledges',
            body: { eventId, donorName: 'Alice', donorEmail: 'alice@test.com', amount: 100 },
        });
        cy.request({
            method: 'POST',
            url: 'http://localhost:5001/api/pledges',
            body: { eventId, donorName: 'Bob', donorEmail: 'bob@test.com', amount: 50 },
        });
        cy.request({
            method: 'POST',
            url: 'http://localhost:5001/api/pledges',
            body: { eventId, donorName: 'Charlie', donorEmail: 'charlie@test.com', amount: 300 },
        });

        // 3. Return the event ID and Title for the test to use
        return cy.wrap({ eventId, eventTitle });
    });
});
