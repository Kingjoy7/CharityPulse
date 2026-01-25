const mongoose = require('mongoose');

const PledgeSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    donorName: {
        type: String,
        required: true
    },
    donorEmail: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pledge', PledgeSchema);