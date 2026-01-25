const request = require('supertest');
const app = require('../../src/backend/server');
const mongoose = require('mongoose');
const User = require('../../src/backend/models/User');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

describe('Admin API - /api/admin', () => {

  let adminUser, regularUser, adminToken, regularToken;

  beforeAll(async () => {
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/charitypulse-test-admin";
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    
    adminUser = await new User({ 
      email: 'admin@test.com', 
      password: 'password123',
      role: 'Admin' 
    }).save();
    
    regularUser = await new User({
      email: 'organizer@test.com',
      password: 'password123',
      role: 'Organizer'
    }).save();
    
    adminToken = jwt.sign({ user: { id: adminUser.id } }, process.env.JWT_SECRET || "supersecretkey");
    regularToken = jwt.sign({ user: { id: regularUser.id } }, process.env.JWT_SECRET || "supersecretkey");
  });

  it('CEFTS-17: should allow an admin to fetch all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('x-auth-token', adminToken); 
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].email).toBe('admin@test.com');
  });
  
  it('CEFTS-17: should NOT allow a non-admin to fetch users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('x-auth-token', regularToken); 
      
    expect(res.statusCode).toEqual(403);
  });

  it('CEFTS-17: should allow an admin to revoke a user', async () => {
    const res = await request(app)
      .post(`/api/admin/users/${regularUser._id}/revoke`)
      .set('x-auth-token', adminToken);
      
    expect(res.statusCode).toEqual(200);
    const revokedUser = await User.findById(regularUser._id);
    expect(revokedUser.isRevoked).toBe(true);
  });
  
  it('CEFTS-17: should prevent a revoked user from logging in', async () => {
    // 1. Admin revokes the user
    await request(app)
      .post(`/api/admin/users/${regularUser._id}/revoke`)
      .set('x-auth-token', adminToken);
      
    // 2. Revoked user tries to log in
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'organizer@test.com', password: 'password123' });
      
    expect(res.statusCode).toEqual(403);
    expect(res.body.msg).toBe('Your account access has been revoked.');
  });
});