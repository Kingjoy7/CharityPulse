const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const logger = require('../logger');
const speakeasy = require('speakeasy');
const crypto = require('crypto'); 

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; 

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  const userRole = role || 'Organizer';

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email: email,
      password: hashedPassword,
      role: userRole
    });

    await user.save();
    logger.info(`New user registered: ${email}`);

    const payload = {
      user: { id: user.id, role: user.role }
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "supersecretkey", 
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, role: user.role }); // Send 201 Created
      }
    );
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Failed login attempt: User not found - ${email}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    if (user.isRevoked) {
      logger.warn(`Admin access denied for user: ${user.email}`, { userId: user.id });
      return res.status(403).json({ msg: 'Your account access has been revoked.' });
    }
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      logger.warn(`Failed login attempt: Account locked - ${email}`, {
        userId: user.id
      });
      return res.status(403).json({ msg: 'Account locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockoutUntil = Date.now() + LOCKOUT_TIME_MS;
      }
      await user.save();

      logger.warn(`Failed login attempt: Invalid password - ${email}`, {
        userId: user.id
      });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    if (user.mfaEnabled) {
      logger.info(`MFA required for user: ${email}`, { userId: user.id });
      return res.json({
        mfaRequired: true,
        userId: user.id 
      });
    }

    logger.info(`Successful login: User ${email} logged in.`, {
      userId: user.id
    });

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, 
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role });
      }
    );
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server error');
  }
});

router.post('/login/2fa', async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'ascii',
      token: token,
      window: 1 
    });

    if (verified) {
      logger.info(`Successful MFA login: User ${user.email} logged in.`, {
        userId: user.id
      });

      const payload = {
        user: { id: user.id, role: user.role }
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET, 
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, role: user.role });
        }
      );
    } else {
      logger.warn(`MFA login failed (invalid token): ${user.email}`, { userId: user.id });
      res.status(400).json({ msg: 'Invalid token, login failed' });
    }
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server error');
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Password reset failed: User not found - ${email}`);
      return res.json({ msg: 'If an account with this email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    logger.info(`Password reset link generated for ${email}: ${resetLink}`);
    console.log(`[MOCK EMAIL] Send to: ${email} - Link: ${resetLink}`);

    res.json({ msg: 'If an account with this email exists, a reset link has been sent.' });

  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server error');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      logger.warn(`Password reset failed: Token is invalid or expired.`);
      return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
    } 

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info(`Password successfully reset for user: ${user.email}`);
    res.json({ msg: 'Password has been reset successfully.' });

  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
