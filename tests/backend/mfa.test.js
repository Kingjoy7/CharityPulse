const request = require('supertest');
const app = require('../../src/backend/server');
const mongoose = require('mongoose');
const User = require('../../src/backend/models/User');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

describe('MFA API - /api/mfa', () => {

  let testUser;
  let authToken;

  beforeAll(async () => {
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/charitypulse-test-mfa";
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    testUser = await new User({ 
      email: 'mfa@test.com', 
      password: 'password123',
      role: 'Organizer'
    }).save();
    
    authToken = jwt.sign(
      { user: { id: testUser.id, email: testUser.email } },
      process.env.JWT_SECRET || "supersecretkey"
    );
  });

  it('CEFTS-24: /setup should generate a secret and QR code', async () => {
    const res = await request(app)
      .post('/api/mfa/setup')
      .set('x-auth-token', authToken); 
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.qrCodeUrl).toContain('data:image/png;base64,');
  });
  
  // --- NEW 500 ERROR TEST ---
  it('POST /setup (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(User, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post('/api/mfa/setup')
      .set('x-auth-token', authToken);
    expect(res.statusCode).toEqual(500);
  });

  it('CEFTS-24: /verify should enable MFA with a correct token', async () => {
    await request(app)
      .post('/api/mfa/setup')
      .set('x-auth-token', authToken);
    
    const user = await User.findById(testUser.id);
    const mfaSecret = user.mfaSecret;

    const validToken = speakeasy.totp({
      secret: mfaSecret,
      encoding: 'ascii',
    });
    
    const verifyRes = await request(app)
      .post('/api/mfa/verify')
      .set('x-auth-token', authToken)
      .send({ token: validToken });

    expect(verifyRes.statusCode).toEqual(200);
    expect(verifyRes.body.msg).toBe('MFA enabled successfully');
  });

  it('CEFTS-24 (Coverage): /verify should fail with an invalid token', async () => {
    await request(app)
      .post('/api/mfa/setup')
      .set('x-auth-token', authToken);
    
    const verifyRes = await request(app)
      .post('/api/mfa/verify')
      .set('x-auth-token', authToken)
      .send({ token: '000000' }); // Invalid token

    expect(verifyRes.statusCode).toEqual(400);
    expect(verifyRes.body.msg).toBe('Invalid token, verification failed');
  });

  // --- NEW 500 ERROR TEST ---
  it('POST /verify (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(User, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post('/api/mfa/verify')
      .set('x-auth-token', authToken)
      .send({ token: '123456' });
    expect(res.statusCode).toEqual(500);
  });
  it('POST /setup (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(User, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post('/api/mfa/setup')
      .set('x-auth-token', authToken);
    expect(res.statusCode).toEqual(500);
  });

  it('POST /verify (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(User, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app)
      .post('/api/mfa/verify')
      .set('x-auth-token', authToken)
      .send({ token: '123456' });
    expect(res.statusCode).toEqual(500);
  });
});