const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Pledge = require("../models/Pledge");
const { Parser } = require("json2csv");
const logger = require("../logger");

router.get("/:id/visuals", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    const pledges = await Pledge.find({ event: req.params.id });

    const totalPledged = pledges.reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    );
    const remaining = Math.max(0, Number(event.targetGoal || 0) - totalPledged);    
    const pieChartData = [
      { label: "Raised", value: totalPledged },
      { label: "Remaining", value: remaining },
    ];
    
    const donorMap = new Map();
    pledges.forEach((p) => {
      const email = (p.donorEmail || "").toLowerCase();

      if (!donorMap.has(email)) {
        donorMap.set(email, {
          name: p.donorName || "Anonymous",
          email,
          amount: 0,
        });
      }
      donorMap.get(email).amount += Number(p.amount || 0);
    });

    const topDonors = Array.from(donorMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);    
    res.json({
      pieChartData: pieChartData || [],
      topDonors: topDonors || [],
    });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send("Server Error");
  }
});

router.get("/:id/summary", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    const pledges = await Pledge.find({ event: req.params.id });

    const totalPledged = pledges.reduce(
      (acc, p) => acc + Number(p.amount || 0),
      0
    );

    res.json({
      title: event.title || "",
      description: event.description || "",
      status: event.status || "Active",
      targetGoal: Number(event.targetGoal || 0),
      totalPledged,
      pledgeCount: pledges.length,
      progress:
        event.targetGoal > 0
          ? (totalPledged / event.targetGoal) * 100
          : 0,
    });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send("Server Error");
  }
});

router.get("/:id/csv", async (req, res) => {
  try {
    const pledges = await Pledge.find({ event: req.params.id }).lean();

    if (!pledges || pledges.length === 0) {
      return res.status(404).json({ msg: "No pledges found for this event." });
    }
    const fields = ["donorName", "donorEmail", "amount", "date"];
    const parser = new Parser({ fields });
    const csv = parser.parse(pledges);

    res.header("Content-Type", "text/csv");
    res.attachment(`pledges-${req.params.id}.csv`);
    res.status(200).send(csv);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send("Server Error");
  }
});

module.exports = router;
