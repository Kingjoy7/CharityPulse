const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  targetGoal: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
});

module.exports = mongoose.model('Event', EventSchema);