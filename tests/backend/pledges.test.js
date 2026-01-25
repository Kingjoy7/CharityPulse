const request = require('supertest');
const app = require('../../src/backend/server');
const mongoose = require('mongoose');
const Event = require('../../src/backend/models/Event');
const Pledge = require('../../src/backend/models/Pledge');

jest.setTimeout(30000);

describe('Pledges API - /api/pledges', () => {

  let testEvent;
  let closedEvent;

  beforeAll(async () => {
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/charitypulse-test-pledges";
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Event.deleteMany({});
    await Pledge.deleteMany({});
    
    testEvent = await new Event({ 
      title: 'Test Event', 
      description: 'Test Description',
      targetGoal: 1000, 
      status: 'Active'
    }).save();
    
    closedEvent = await new Event({ 
      title: 'Closed Event', 
      description: 'Test Description',
      targetGoal: 1000, 
      status: 'Closed'
    }).save();
  });

  it('CEFTS-7: should submit a new pledge successfully', async () => {
    const pledgeData = {
      eventId: testEvent._id,
      donorName: 'Test Donor',
      donorEmail: 'donor@test.com',
      amount: 100
    };

    const res = await request(app)
      .post('/api/pledges')
      .send(pledgeData);

    // 1. Check response
    expect(res.statusCode).toEqual(201);
    expect(res.body.donorName).toBe('Test Donor');
    expect(res.body.amount).toBe(100);

    // 2. Check database
    const dbPledge = await Pledge.findOne({ donorEmail: 'donor@test.com' });
    expect(dbPledge).toBeDefined();
    expect(dbPledge.amount).toBe(100);
  });

  it('CEFTS-6: should reject a pledge with an amount of 0', async () => {
    const pledgeData = {
      eventId: testEvent._id,
      donorName: 'Test Donor',
      donorEmail: 'donor@test.com',
      amount: 0 // Invalid amount
    };

    const res = await request(app)
      .post('/api/pledges')
      .send(pledgeData);

    // Check error response
    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe('Pledge amount must be greater than 0');
  });
  
  it('CEFTS-6: should reject a pledge with missing fields', async () => {
    const pledgeData = {
      eventId: testEvent._id,
      donorName: 'Test Donor',
      // amount is missing
    };

    const res = await request(app)
      .post('/api/pledges')
      .send(pledgeData);

    // Check error response
    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe('Please fill all fields');
  });

  it('CEFTS-5: should reject a pledge to a closed event', async () => {
    const pledgeData = {
      eventId: closedEvent._id, // Using the closed event
      donorName: 'Test Donor',
      donorEmail: 'donor@test.com',
      amount: 100
    };

    const res = await request(app)
      .post('/api/pledges')
      .send(pledgeData);

    // Check error response
    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe('This event is closed and no longer accepting pledges');
  });

  it('should return 404 for a non-existent event', async () => {
    const pledgeData = {
      eventId: '60d5ec49e7b4e01234567890', // Fake ID
      donorName: 'Test Donor',
      donorEmail: 'donor@test.com',
      amount: 100
    };

    const res = await request(app)
      .post('/api/pledges')
      .send(pledgeData);

    // Check error response
    expect(res.statusCode).toEqual(404);
    expect(res.body.msg).toBe('Event not found');
  });
  
});