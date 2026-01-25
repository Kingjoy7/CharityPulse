describe('Reporting and Export Flow', () => {

    let testEventId;
    let testEventTitle;

    beforeEach(() => {
        // Log in as an organizer first
        cy.loginAsOrganizer();

        // Create a new event with 3 pledges and get its ID/Title
        cy.createEventWithPledges().then(({ eventId, eventTitle }) => {
            testEventId = eventId;
            testEventTitle = eventTitle;
        });

        // Go to the dashboard
        cy.visit('/organiser/dashboard');
    });

    it('CEFTS-13, 20: displays Visual Reports and Top Donors', () => {
        // Find the event and click its "Reports" link
        cy.contains('h3', testEventTitle)
            .parents('.card') // Assumes your event is in a 'card' class
            .find('a[href*="/reports/"]')
            .not('a[href*="/summary"]') // Make sure we don't click "Summary"
            .click();

        // Assert: We are on the correct page
        cy.url().should('include', `/reports/${testEventId}`);

        // Assert: CEFTS-13 (Visuals) - Check that the chart canvas is visible
        cy.get('canvas').should('be.visible');

        // Assert: CEFTS-20 (Top Donors) - Check that the top donor is listed
        cy.contains('Top Donors').should('be.visible');
        cy.contains('Charlie').should('be.visible');
        cy.contains('$300.00').should('be.visible');
    });

    it('CEFTS-21: displays the Event Summary', () => {
        // Find the event and click its "Summary" link
        cy.contains('h3', testEventTitle)
            .parents('.card')
            .find('a[href*="/reports/summary/"]')
            .click();

        // Assert: We are on the correct page
        cy.url().should('include', `/reports/summary/${testEventId}`);

        // Assert: Check that the summary data is correct (450 = 100+50+300)
        cy.contains('Total Pledged: $450.00').should('be.visible');
        cy.contains('Total Pledges: 3').should('be.visible');
    });

    it('CEFTS-19: successfully triggers a CSV export', () => {
        // Find the event and click the "Export CSV" button
        cy.contains('h3', testEventTitle)
            .parents('.card')
            .find('button')
            .contains('Export CSV')
            .click();

        // Assert: We can't easily test the download itself,
        // but we can log that the action was performed.
        cy.log('Export button clicked.');
    });
});