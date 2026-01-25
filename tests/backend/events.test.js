const request = require('supertest');
const app = require('../../src/backend/server');
const mongoose = require('mongoose');
const Event = require('../../src/backend/models/Event');
const Pledge = require('../../src/backend/models/Pledge');
const User = require('../../src/backend/models/User'); 
const jwt = require('jsonwebtoken'); 

jest.setTimeout(30000);

describe('Events API - /api/events', () => {

  let testEvent;
  let testOrganizer;
  let testToken;

  beforeAll(async () => {
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/charitypulse-test-events";
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Event.deleteMany({});
    await Pledge.deleteMany({});
    await User.deleteMany({}); 
    
    testOrganizer = await new User({ 
      email: 'organizer@test.com', 
      password: 'hashedpassword', 
      role: 'Organizer' 
    }).save();
    
    testToken = jwt.sign(
      { user: { id: testOrganizer.id } },
      process.env.JWT_SECRET || "supersecretkey"
    );

    testEvent = await new Event({ 
      title: 'Test Event', 
      description: 'Test Description', 
      targetGoal: 1000, 
      status: 'Active',
      organizer: testOrganizer.id 
    }).save();
    
    await new Pledge({ event: testEvent._id, donorName: 'Alice', donorEmail: 'a@t.com', amount: 100 }).save();
    await new Pledge({ event: testEvent._id, donorName: 'Bob', donorEmail: 'b@t.com', amount: 50 }).save();
  });

  it('should GET / and return all active events with progress', async () => {
    await new Event({ 
      title: 'Closed Event', 
      description: 'Test', 
      targetGoal: 100, 
      status: 'Closed', 
      organizer: testOrganizer.id 
    }).save();
    
    const res = await request(app).get('/api/events');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(1); 
    expect(res.body[0].title).toBe('Test Event');
  });

  it('CEFTS-4: should update an existing event via PUT', async () => {
    const res = await request(app)
      .put(`/api/events/${testEvent._id}`)
      .set('x-auth-token', testToken) 
      .send({ title: 'New Title', description: 'New Desc', targetGoal: 500 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toBe('New Title');
  });

  it('CEFTS-4 (Coverage): should return 404 when updating a non-existent event', async () => {
    const res = await request(app)
      .put('/api/events/60d5ec49e7b4e01234567890') 
      .set('x-auth-token', testToken) 
      .send({ title: 'New Title', description: 'New Desc', targetGoal: 500 });

    expect(res.statusCode).toEqual(404); 
  });

  it('CEFTS-4: should delete an existing event via DELETE', async () => {
    const eventToDelete = await new Event({ 
      title: 'To Be Deleted', 
      description: 'Test description',
      targetGoal: 100, 
      organizer: testOrganizer.id 
    }).save();

    const res = await request(app)
      .delete(`/api/events/${eventToDelete._id}`)
      .set('x-auth-token', testToken); 

    expect(res.statusCode).toEqual(200); 
  });
  
  it('CEFTS-4 (Coverage): should return 404 when deleting a non-existent event', async () => {
    const res = await request(app)
      .delete('/api/events/60d5ec49e7b4e01234567890') 
      .set('x-auth-token', testToken); 

    expect(res.statusCode).toEqual(404); 
  });

  it('CEFTS-4: should NOT delete an event if it has pledges', async () => {
    const res = await request(app)
      .delete(`/api/events/${testEvent._id}`) 
      .set('x-auth-token', testToken); 
      
    expect(res.statusCode).toEqual(400); 
  });
  
  it('CEFTS-5: should close an existing event via POST /:id/close', async () => {
    const res = await request(app)
      .post(`/api/events/${testEvent._id}/close`)
      .set('x-auth-token', testToken); 
      
    expect(res.statusCode).toEqual(200);
  });

  it('CEFTS-5: should return 404 when closing a non-existent event', async () => {
    const res = await request(app)
      .post('/api/events/60d5ec49e7b4e01234567890/close') 
      .set('x-auth-token', testToken); 
      
    expect(res.statusCode).toEqual(404);
  });

  it('CEFTS-4 (Coverage): should return 401 if a non-owner tries to update', async () => {
    const otherUser = await new User({ email: 'other@test.com', password: 'password', role: 'Organizer' }).save();
    const otherToken = jwt.sign({ user: { id: otherUser.id } }, process.env.JWT_SECRET || "supersecretkey");

    const res = await request(app)
      .put(`/api/events/${testEvent._id}`)
      .set('x-auth-token', otherToken) 
      .send({ title: 'New Title', description: 'New Desc', targetGoal: 500 }); 

    expect(res.statusCode).toEqual(401);
  });

  it('CEFTS-4 (Coverage): should return 401 if a non-owner tries to delete', async () => {
    const otherUser = await new User({ email: 'other@test.com', password: 'password', role: 'Organizer' }).save();
    const otherToken = jwt.sign({ user: { id: otherUser.id } }, process.env.JWT_SECRET || "supersecretkey");

    const res = await request(app)
      .delete(`/api/events/${testEvent._id}`)
      .set('x-auth-token', otherToken); 

    expect(res.statusCode).toEqual(401);
  });

  it('CEFTS-5 (Coverage): should return 401 if a non-owner tries to close', async () => {
    const otherUser = await new User({ email: 'other@test.com', password: 'password', role: 'Organizer' }).save();
    const otherToken = jwt.sign({ user: { id: otherUser.id } }, process.env.JWT_SECRET || "supersecretkey");

    const res = await request(app)
      .post(`/api/events/${testEvent._id}/close`)
      .set('x-auth-token', otherToken);

    expect(res.statusCode).toEqual(401);
  });
  
  it('GET /:id (Coverage): should return 404 for a non-existent event', async () => {
    const res = await request(app)
      .get('/api/events/60d5ec49e7b4e01234567890'); 

    expect(res.statusCode).toEqual(404);
  });

  // --- NEW TESTS TO FIX 500 ERROR COVERAGE ---
  
  it('GET / (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'find').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toEqual(500);
    expect(res.text).toBe('Server Error');
  });
  
  it('GET /:id (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get(`/api/events/${testEvent._id}`);
    expect(res.statusCode).toEqual(500);
    expect(res.text).toBe('Server Error');
  });

  it('POST / (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post('/api/events')
      .set('x-auth-token', testToken)
      .send({ title: 'New Event', description: 'Test', targetGoal: 100 });
    expect(res.statusCode).toEqual(500);
    expect(res.text).toBe('Server Error');
  });
  
  it('PUT /:id (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .put(`/api/events/${testEvent._id}`)
      .set('x-auth-token', testToken)
      .send({ title: 'New Title' });
    expect(res.statusCode).toEqual(500);
  });
  
  it('DELETE /:id (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .delete(`/api/events/${testEvent._id}`)
      .set('x-auth-token', testToken);
    expect(res.statusCode).toEqual(500);
  });
  
  it('POST /:id/close (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post(`/api/events/${testEvent._id}/close`)
      .set('x-auth-token', testToken);
    expect(res.statusCode).toEqual(500);
  });

  // --- NEW TEST FOR GET /my-events ---
  it('GET /my-events (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'find').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .get('/api/events/my-events')
      .set('x-auth-token', testToken);
    expect(res.statusCode).toEqual(500);
  });
  
});