const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin'); 
const logger = require('../logger');



router.get('/users', [auth, admin], async (req, res) => {
  try {
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server Error');
  }
});


router.get('/events', [auth, admin], async (req, res) => {
  try {
    
    
    const events = await Event.find()
      .populate('organizer', 'email')
      .sort({ startDate: -1 });
    res.json(events);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server Error');
  }
});


router.post('/users/:id/revoke', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.isRevoked = true;
    await user.save();
    
    logger.info(`Admin (ID: ${req.user.id}) revoked access for User (ID: ${user.id})`);
    res.json({ msg: 'User access revoked' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server Error');
  }
});

module.exports = router;