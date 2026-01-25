const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const auth = require('../middleware/auth');
const logger = require('../logger');

router.post('/setup', auth, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `CharityPulse (${req.user.email})`
    });

    const user = await User.findById(req.user.id);
    user.mfaSecret = secret.ascii;
    user.mfaEnabled = false;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        throw new Error('Could not generate QR code');
      }
      res.json({ qrCodeUrl: data_url });
    });

  } catch (err) {
    logger.error(err.message, { stack: err.stack, userId: req.user.id });
    res.status(500).send('Server Error');
  }
});

router.post('/verify', auth, async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user.mfaSecret) {
      return res.status(400).json({ msg: 'MFA not set up. Please set up first.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'ascii',
      token: token,
      window: 1
    });

    if (verified) {
      user.mfaEnabled = true;
      await user.save();
      logger.info(`MFA enabled for user: ${user.email}`, { userId: user.id });
      res.json({ msg: 'MFA enabled successfully' });
    } else {
      logger.warn(`MFA verification failed for user: ${user.email}`, { userId: user.id });
      res.status(400).json({ msg: 'Invalid token, verification failed' });
    }
  } catch (err) {
    logger.error(err.message, { stack: err.stack, userId: req.user.id });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
