const User = require('../models/User');
const logger = require('../logger');

module.exports = async function(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.role !== 'Admin') {
      logger.warn(`Admin access denied for user: ${user.email}`, { userId: user.id });
      return res.status(403).json({ msg: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Server Error');
  }
};