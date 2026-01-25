const request = require("supertest");
const app = require("../../src/backend/server");
const mongoose = require("mongoose");
const User = require("../../src/backend/models/User");
const bcrypt = require("bcryptjs");

// ⭐ CRITICAL FIX: JWT signing requires a secret in test environment
process.env.JWT_SECRET = "test_jwt_secret_key";

jest.setTimeout(30000);

describe("Auth API - Extended Tests", () => {
  beforeAll(async () => {
    const MONGODB_TEST_URI =
      process.env.MONGODB_TEST_URI ||
      "mongodb://localhost:27017/charitypulse-test";

    await mongoose.connect(MONGODB_TEST_URI);
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ------------------------------------------------------------------
  // 1️⃣ REGISTER
  // ------------------------------------------------------------------
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "newuser@test.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe("Organizer");
  });

  // ------------------------------------------------------------------
  // 2️⃣ LOGIN SUCCESS
  // ------------------------------------------------------------------
  it("should log in successfully with correct credentials", async () => {
    const user = new User({
      email: "logintest@test.com",
      password: await bcrypt.hash("mypassword", 10),
      role: "Organizer",
      failedLoginAttempts: 0,
    });

    await user.save();

    const res = await request(app).post("/api/auth/login").send({
      email: "logintest@test.com",
      password: "mypassword",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  // ------------------------------------------------------------------
  // 3️⃣ LOCKOUT AFTER 5 FAILS
  // ------------------------------------------------------------------
  it("should lock the user after 5 failed attempts", async () => {
    const user = new User({
      email: "locktest@test.com",
      password: await bcrypt.hash("correctpassword", 10),
      failedLoginAttempts: 0,
    });

    await user.save();

    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/auth/login").send({
        email: "locktest@test.com",
        password: "wrong",
      });
    }

    const lockedUser = await User.findOne({ email: "locktest@test.com" });
    expect(lockedUser.lockoutUntil).not.toBeNull();
  });

  // ------------------------------------------------------------------
  // 4️⃣ LOGIN WHEN LOCKED
  // ------------------------------------------------------------------
  it("should reject login when account is locked", async () => {
    const user = await User.findOne({ email: "locktest@test.com" });

    user.lockoutUntil = Date.now() + 10000; // enforce lockout
    await user.save();

    const res = await request(app).post("/api/auth/login").send({
      email: "locktest@test.com",
      password: "correctpassword",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe("Account locked. Try again later.");
  });

  // ------------------------------------------------------------------
  // 5️⃣ MFA REQUIRED
  // ------------------------------------------------------------------
  it("should return mfaRequired when user has MFA enabled", async () => {
    const mfaUser = new User({
      email: "mfatest@test.com",
      password: await bcrypt.hash("password123", 10),
      mfaEnabled: true,
      mfaSecret: "abcd1234",
    });

    await mfaUser.save();

    const res = await request(app).post("/api/auth/login").send({
      email: "mfatest@test.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.mfaRequired).toBe(true);
    expect(res.body.userId).toBeDefined();
  });

  // ------------------------------------------------------------------
  // 6️⃣ MFA INVALID TOKEN
  // ------------------------------------------------------------------
  it("should reject MFA login with invalid token", async () => {
    const user = await User.findOne({ email: "mfatest@test.com" });

    const res = await request(app).post("/api/auth/login/2fa").send({
      userId: user._id,
      token: "000000",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe("Invalid token, login failed");
  });

  // ------------------------------------------------------------------
  // 7️⃣ REVOKED USER
  // ------------------------------------------------------------------
  it("should block login if user is revoked", async () => {
    const revoked = new User({
      email: "revoked@test.com",
      password: await bcrypt.hash("hello123", 10),
      isRevoked: true,
    });

    await revoked.save();

    const res = await request(app).post("/api/auth/login").send({
      email: "revoked@test.com",
      password: "hello123",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe("Your account access has been revoked.");
  });

  // ------------------------------------------------------------------
  // 8️⃣ FORGOT PASSWORD RETURN ALWAYS OK
  // ------------------------------------------------------------------
  it("forgot-password should return success message regardless", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: "anyone@example.com",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toContain("reset link has been sent");
  });

  // ------------------------------------------------------------------
  // 9️⃣ INVALID RESET TOKEN
  // ------------------------------------------------------------------
  it("reset-password should fail for invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password/invalidtoken")
      .send({ password: "newpass123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toContain("invalid or has expired");
  });
});
