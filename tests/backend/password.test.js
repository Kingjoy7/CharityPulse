const request = require('supertest');
const app = require('../../src/backend/server');
const mongoose = require('mongoose');
const User = require('../../src/backend/models/User');

jest.setTimeout(30000);

describe('Password Reset API - /api/auth', () => {

    let testUser;

    beforeAll(async () => {
        const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/charitypulse-test-password";
        await mongoose.connect(MONGODB_TEST_URI);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        testUser = await new User({
            email: 'reset@test.com',
            password: 'oldpassword', // In a real app, hash this
            role: 'Organizer'
        }).save();
    });

    it('CEFTS-16: /forgot-password should generate a reset token', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'reset@test.com' });

        expect(res.statusCode).toEqual(200);

        const user = await User.findById(testUser.id);
        expect(user.resetPasswordToken).toBeDefined();
        expect(user.resetPasswordExpires).toBeDefined();
    });

    it('CEFTS-16: /reset-password should update the password with a valid token', async () => {
        // 1. Generate token
        const token = 'test-token-123';
        testUser.resetPasswordToken = token;
        testUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await testUser.save();

        // 2. Send reset request
        const res = await request(app)
            .post(`/api/auth/reset-password/${token}`)
            .send({ password: 'newpassword' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.msg).toBe('Password has been reset successfully.');

        // 3. Verify token is cleared and password is changed
        const updatedUser = await User.findById(testUser.id);
        expect(updatedUser.resetPasswordToken).toBeUndefined();
        expect(updatedUser.resetPasswordExpires).toBeUndefined();
        expect(updatedUser.password).not.toBe('oldpassword');
    });

    it('CEFTS-16: /reset-password should fail with an invalid token', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password/invalid-token')
            .send({ password: 'newpassword' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.msg).toBe('Password reset token is invalid or has expired.');
    });
});