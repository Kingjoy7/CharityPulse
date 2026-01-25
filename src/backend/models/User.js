const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Organizer', 'Admin', 'User'], 
    default: 'User',
  },
  failedLoginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockoutUntil: {
    type: Date
  },
  mfaSecret: {
    type: String, 
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  isRevoked: { 
    type: Boolean, 
    default: false 
  },

  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

module.exports = mongoose.model('User', UserSchema);