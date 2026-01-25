const express = require('express');
const router = express.Router();
const Pledge = require('../models/Pledge');
const Event = require('../models/Event');
const logger = require('../logger');

router.post('/', async (req, res) => {
    const { eventId, donorName, donorEmail, amount } = req.body;

    if (parseFloat(amount) <= 0) {
        return res.status(400).json({ msg: 'Pledge amount must be greater than 0' });
    }

    if (!eventId || !donorName || !donorEmail || !amount) {
        return res.status(400).json({ msg: 'Please fill all fields' });
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        if (event.status === 'Closed') {
            return res.status(400).json({ msg: 'This event is closed and no longer accepting pledges' });
        }

        const newPledge = new Pledge({
            event: eventId,
            donorName,
            donorEmail,
            amount
        });

        const pledge = await newPledge.save();
        
        logger.info(`New pledge of $${amount} submitted for event ${eventId} by ${donorEmail}`);

        res.status(201).json(pledge);
    } catch (err) {
        logger.error(err.message, { stack: err.stack });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
