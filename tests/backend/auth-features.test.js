const request = require('supertest');
const app = require('../../src/backend/server');
const mongoose = require('mongoose');
const User = require('../../src/backend/models/User');

jest.setTimeout(30000);

describe('Auth Features API - /api/auth', () => {

  let testUser;

  beforeAll(async () => {
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/charitypulse-test-auth-features";
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    testUser = await new User({ 
      email: 'user@test.com', 
      password: 'hashedpassword',
      role: 'Organizer'
    }).save();
  });

  // --- Tests for /register (Covers lines 83-150) ---
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@test.com', password: 'password123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    
    const dbUser = await User.findOne({ email: 'newuser@test.com' });
    expect(dbUser).toBeDefined();
  });

  it('should fail to register a user that already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'password123' }); // User from beforeEach

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe('User already exists');
  });

  it('should fail to register with no email or password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' }); // Email is missing

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe('Please enter all fields');
  });
  
  it('POST /register (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@test.com', password: 'password123' });
    expect(res.statusCode).toEqual(500);
  });

  // --- Tests for Password Reset (CEFTS-16) (Covers lines 156-197) ---
  it('CEFTS-16: /forgot-password should generate a reset token', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@test.com' });
      
    expect(res.statusCode).toEqual(200);
    
    const user = await User.findById(testUser.id);
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpires).toBeDefined();
  });
  
  it('CEFTS-16: /forgot-password should return 200 even if user not found', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nouser@test.com' });
      
    expect(res.statusCode).toEqual(200); // Prevents user enumeration
    expect(res.body.msg).toBe('If an account with this email exists, a reset link has been sent.');
  });

  it('POST /forgot-password (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@test.com' });
    expect(res.statusCode).toEqual(500);
  });
  
  // Note: 'password.test.js' already covers the reset-password routes
});