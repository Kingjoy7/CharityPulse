const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Pledge = require('../models/Pledge');
const logger = require('../logger');
const auth = require('../middleware/auth');

router.get('/my-events', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ startDate: -1 });

    const eventsWithProgress = await Promise.all(
      events.map(async (event) => {
        const pledges = await Pledge.find({ event: event._id });
        const totalPledged = pledges.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        return {
          ...event.toObject(),
          totalPledged,
          progress: event.targetGoal ? (totalPledged / event.targetGoal) * 100 : 0,
        };
      })
    );

    res.json(eventsWithProgress);
  } catch (err) {
    logger.error('GET /my-events error', { message: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, targetGoal, endDate } = req.body;

  try {
    const newEvent = new Event({
      title,
      description,
      targetGoal,
      endDate,
      organizer: req.user.id
    });

    const event = await newEvent.save();
    logger.info(`New event created: ${event.title} by user ${req.user.id}`);
    res.status(201).json(event);
  } catch (err) {
    logger.error('POST / events error', { message: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, description, targetGoal, endDate } = req.body;

  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (!event.organizer || event.organizer.toString() !== req.user.id) {
      logger.warn(`Event update forbidden: User ${req.user.id} does not own event ${event._id}`);
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, targetGoal, endDate } },
      { new: true }
    );

    logger.info(`Event updated: ${updatedEvent.title} (ID: ${updatedEvent._id})`);
    res.json(updatedEvent);
  } catch (err) {
    logger.error('PUT /:id error', { message: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      logger.warn(`Event delete failed: Not found - ${req.params.id}`);
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (!event.organizer || event.organizer.toString() !== req.user.id) {
      logger.warn(`Event delete forbidden: User ${req.user.id} does not own event ${event._id}`);
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const pledgeCount = await Pledge.countDocuments({ event: req.params.id });
    if (pledgeCount > 0) {
      return res.status(400).json({ msg: 'Cannot delete an event that has pledges.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    logger.info(`Event deleted: ${event.title} (ID: ${event._id})`);
    res.json({ msg: 'Event removed' });
  } catch (err) {
    logger.error('DELETE /:id error', { message: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
});

router.post('/:id/close', auth, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    if (!event.organizer || event.organizer.toString() !== req.user.id) {
      logger.warn(`Event close forbidden: User ${req.user.id} does not own event ${event._id}`);
      return res.status(401).json({ msg: 'User not authorized' });
    }

    event.status = 'Closed';
    await event.save();

    logger.info(`Event closed: ${event.title} (${event._id})`);
    res.json(event);
  } catch (err) {
    logger.error('POST /:id/close error', { message: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ status: { $ne: 'Closed' } }).sort({ startDate: -1 });

    const eventsWithProgress = await Promise.all(
      events.map(async (event) => {
        const pledges = await Pledge.find({ event: event._id });
        const totalPledged = pledges.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        return {
          _id: event._id,
          title: event.title,
          description: event.description ? event.description.substring(0, 100) + '...' : '',
          targetGoal: event.targetGoal,
          totalPledged,
          progress: event.targetGoal ? (totalPledged / event.targetGoal) * 100 : 0,
        };
      })
    );
    res.json(eventsWithProgress);
  } catch (err) {
    logger.error('GET / error', { message: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const pledges = await Pledge.find({ event: req.params.id });
    const totalPledged = pledges.reduce((acc, pledge) => acc + (Number(pledge.amount) || 0), 0);

    res.json({
      ...event.toObject(),
      totalPledged,
      progress: event.targetGoal ? (totalPledged / event.targetGoal) * 100 : 0,
      pledgeCount: pledges.length
    });
  } catch (err) {
    logger.error('GET /:id (single event) error', { message: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
