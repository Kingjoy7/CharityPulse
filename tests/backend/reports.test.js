const request = require('supertest');
const app = require('../../src/backend/server');
const mongoose = require('mongoose');
const Event = require('../../src/backend/models/Event');
const Pledge = require('../../src/backend/models/Pledge');

jest.setTimeout(30000);

let testEvent;

describe('Reports API - /api/reports', () => {

  beforeAll(async () => {
    const uri = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/charitypulse-test-reports";
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Event.deleteMany({});
    await Pledge.deleteMany({});

    testEvent = await new Event({
      title: "Test Event",
      description: "...",
      targetGoal: 1000,
      status: "Active"
    }).save();

    await new Pledge({ event: testEvent._id, donorName: "Alice", donorEmail: "a@t.com", amount: 100 }).save();
    await new Pledge({ event: testEvent._id, donorName: "Bob", donorEmail: "b@t.com", amount: 50 }).save();
  });

  // ---------------------------------------------------------
  // CEFTS-13 + CEFTS-20 : Visual report + top donors
  // ---------------------------------------------------------
  it("CEFTS-13 & 20: should return visual report data and top donors", async () => {

    await new Pledge({ event: testEvent._id, donorName: "Charlie", donorEmail: "c@t.com", amount: 300 }).save();
    await new Pledge({ event: testEvent._id, donorName: "David", donorEmail: "d@t.com", amount: 25 }).save();

    const res = await request(app).get(`/api/reports/${testEvent._id}/visuals`);

    expect(res.statusCode).toBe(200);

    // -------------------------
    // Validate top donors
    // -------------------------
    expect(res.body.topDonors).toHaveLength(4);
    expect(res.body.topDonors[0].name).toBe("Charlie");
    expect(res.body.topDonors[0].amount).toBe(300);
    expect(res.body.topDonors[1].name).toBe("Alice");
    expect(res.body.topDonors[1].amount).toBe(100);

    // -------------------------
    // --- THIS IS THE FIX ---
    // Your API is sending an array of objects, not a Chart.js object.
    // This test now correctly checks for that array.
    // -------------------------
    const total = 300 + 100 + 50 + 25; // 475
    const remaining = 1000 - total;    // 525

    expect(res.body.pieChartData).toEqual([
      { label: "Raised", value: total },
      { label: "Remaining", value: remaining }
    ]);
  });

  // ---------------------------------------------------------
  // CEFTS-21 : Event summary
  // ---------------------------------------------------------
  it("CEFTS-21: should return a correct event summary", async () => {
    const res = await request(app).get(`/api/reports/${testEvent._id}/summary`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test Event");
    expect(res.body.totalPledged).toBe(150); // 100 + 50
  });

  // ---------------------------------------------------------
  // CEFTS-19 : CSV export
  // ---------------------------------------------------------
  it("CEFTS-19: should return a CSV file with pledge data", async () => {
    const res = await request(app).get(`/api/reports/${testEvent._id}/csv`);
    expect(res.statusCode).toBe(200);
    expect(res.header["content-type"]).toBe("text/csv; charset=utf-8");
  });

  // --- ADDING 500 ERROR TESTS FOR COVERAGE ---

  it('GET /:id/visuals (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get(`/api/reports/${testEvent._id}/visuals`);
    expect(res.statusCode).toEqual(500);
  });

  it('GET /:id/summary (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get(`/api/reports/${testEvent._id}/summary`);
    expect(res.statusCode).toEqual(500);
  });

  it('GET /:id/csv (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Pledge, 'find').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get(`/api/reports/${testEvent._id}/csv`);
    expect(res.statusCode).toEqual(500);
  });
  it('GET /:id/visuals (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get(`/api/reports/${testEvent._id}/visuals`);
    expect(res.statusCode).toEqual(500);
  });

  it('GET /:id/summary (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Event, 'findById').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get(`/api/reports/${testEvent._id}/summary`);
    expect(res.statusCode).toEqual(500);
  });

  it('GET /:id/csv (Coverage): should return 500 on database failure', async () => {
    jest.spyOn(Pledge, 'find').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });
    const res = await request(app).get(`/api/reports/${testEvent._id}/csv`);
    expect(res.statusCode).toEqual(500);
  });

});
