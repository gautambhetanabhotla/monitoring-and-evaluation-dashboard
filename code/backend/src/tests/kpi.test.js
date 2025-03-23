// kpi.test.js
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import kpiRouter from '../routes/kpi.routes.js';
import authRouter from '../routes/auth.routes.js';
import User from '../models/User.model.js';
import Kpi from '../models/Kpi.model.js';
import KpiUpdate from '../models/KpiUpdate.model.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  session({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use('/api/auth', authRouter);
app.use('/api/kpi', kpiRouter);

jest.setTimeout(20000);

let adminUser;
let fieldUser; // user with role "field staff" or any other non-admin role
let normalUser; // non-admin (client) user for testing role restrictions
let testProjectId; // dummy project id
let testKpi; // will hold a created KPI document
let testKpiUpdate; // will hold a KPI update document

const adminPassword = 'password123';
const fieldPassword = 'field123';
const userPassword = 'password123';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI, {});

  // Clean up previous test data
  await User.deleteMany({
    email: { $in: ['admin@kpi.com', 'field@kpi.com', 'user@kpi.com'] },
  });
  await Kpi.deleteMany({});
  await KpiUpdate.deleteMany({});

  // Create an admin user
  const adminHash = await bcrypt.hash(adminPassword, 10);
  adminUser = await User.create({
    email: 'admin@kpi.com',
    passwordHash: adminHash,
    role: 'admin',
    username: 'adminKpi',
    phone_number: '1111111111',
  });

  // Create a field staff user (authorized for KPI updates)
  const fieldHash = await bcrypt.hash(fieldPassword, 10);
  fieldUser = await User.create({
    email: 'field@kpi.com',
    passwordHash: fieldHash,
    role: 'field staff',
    username: 'fieldKpi',
    phone_number: '3333333333',
  });

  // Create a normal user (non-admin)
  const userHash = await bcrypt.hash(userPassword, 10);
  normalUser = await User.create({
    email: 'user@kpi.com',
    passwordHash: userHash,
    role: 'client',
    username: 'clientKpi',
    phone_number: '2222222222',
  });

  // Create a dummy project id (assuming project exists in your system)
  testProjectId = new mongoose.Types.ObjectId().toHexString();
});

afterAll(async () => {
  await User.deleteMany({
    email: { $in: ['admin@kpi.com', 'field@kpi.com', 'user@kpi.com'] },
  });
  await Kpi.deleteMany({});
  await KpiUpdate.deleteMany({});
  await mongoose.connection.close();
});

// Helper function to login a user
const loginAs = async (agent, email, password) => {
  const res = await agent.post('/api/auth/login').send({ email, password });
  expect(res.statusCode).toBe(200);
  return res;
};

// Factory for valid KPI creation data
const getValidKpiData = () => ({
  project_id: testProjectId,
  indicator: "Test Indicator",
  what_it_tracks: "Some performance metric",
  logframe_level: "Outcome",
  explanation: "This KPI measures something important.",
  baseline: 10,
  target: 50,
});

// Factory for valid KPI update data
const getValidKpiUpdateData = () => ({
  project_id: testProjectId,
  task_id: new mongoose.Types.ObjectId().toHexString(),
  initial: 10,
  final: 20,
  updated_at: new Date().toISOString(),
  note: "First update",
});

describe('KPI Routes (Real Database)', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  afterEach(async () => {
    // Logout after each test if needed
    await agent.post('/api/auth/logout');
  });

  describe('POST /api/kpi/create', () => {
    test('Should create a KPI when all required fields are provided (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const validData = getValidKpiData();

      const res = await agent.post('/api/kpi/create').send(validData);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("KPI saved successfully");
      expect(res.body).toHaveProperty('id');

      testKpi = await Kpi.findById(res.body.id);
      expect(testKpi).not.toBeNull();
    });

    test('Should return 400 if required fields are missing', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const incompleteData = {
        project_id: testProjectId,
        indicator: "Missing fields KPI",
        what_it_tracks: "Metric",
        // Missing logframe_level, baseline, target
      };

      const res = await agent.post('/api/kpi/create').send(incompleteData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Please give values for all the fields");
    });

    test('Should return 403 if a non-admin user attempts to create a KPI', async () => {
      await loginAs(agent, normalUser.email, userPassword);
      const validData = getValidKpiData();
      const res = await agent.post('/api/kpi/create').send(validData);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });

  describe('GET /api/kpi/getKpis/:project_id', () => {
    test('Should return 400 for invalid project_id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get('/api/kpi/getKpis/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid project ID");
    });

    test('Should return 200 and list KPIs for a valid project_id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get(`/api/kpi/getKpis/${testProjectId}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /api/kpi/edit/:id', () => {
    const updateData = {
      project_id: testProjectId,
      indicator: "Updated Indicator",
      what_it_tracks: "Updated tracking info",
      logframe_level: "Impact",
      explanation: "Updated explanation",
      baseline: 15,
      target: 60,
    };

    test('Should update an existing KPI (as admin)', async () => {
      // Create a KPI if not already created
      if (!testKpi) {
        await loginAs(agent, adminUser.email, adminPassword);
        const createRes = await agent.post('/api/kpi/create').send(getValidKpiData());
        testKpi = await Kpi.findById(createRes.body.id);
      }
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.put(`/api/kpi/edit/${testKpi._id}`).send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("KPI updated successfully");

      const updatedKpi = await Kpi.findById(testKpi._id);
      expect(updatedKpi.indicator).toBe("Updated Indicator");
    });

    test('Should return 400 if required fields are missing during update', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const incompleteUpdate = {
        indicator: "Incomplete update",
        // Missing what_it_tracks, logframe_level, baseline, target
      };
      const res = await agent.put(`/api/kpi/edit/${testKpi._id}`).send(incompleteUpdate);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Please give values for all the fields");
    });
  });

  describe('DELETE /api/kpi/delete/:id', () => {
    let kpiToDelete;
    beforeAll(async () => {
      kpiToDelete = await Kpi.create(getValidKpiData());
    });

    test('Should return 404 if KPI does not exist', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await agent.delete(`/api/kpi/delete/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("KPI not found");
    });

    test('Should delete a KPI when provided a valid id (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.delete(`/api/kpi/delete/${kpiToDelete._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("KPI deleted successfully");

      const found = await Kpi.findById(kpiToDelete._id);
      expect(found).toBeNull();
    });

    test('Should return 403 if a non-admin user attempts to delete a KPI', async () => {
      // Create a KPI for deletion test
      const kpiForNonAdmin = await Kpi.create(getValidKpiData());
      await loginAs(agent, normalUser.email, userPassword);
      const res = await agent.delete(`/api/kpi/delete/${kpiForNonAdmin._id}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });

  describe('PUT /api/kpi/update/:kpi_id', () => {
    test('Should create a KPI update (as admin)', async () => {
      // Ensure a KPI exists
      if (!testKpi) {
        await loginAs(agent, adminUser.email, adminPassword);
        const createRes = await agent.post('/api/kpi/create').send(getValidKpiData());
        testKpi = await Kpi.findById(createRes.body.id);
      }
      await loginAs(agent, adminUser.email, adminPassword);
      const updateData = getValidKpiUpdateData();
      const res = await agent.put(`/api/kpi/update/${testKpi._id}`).send(updateData);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("KPI update saved successfully");
      expect(res.body).toHaveProperty('id');
      testKpiUpdate = await KpiUpdate.findById(res.body.id);
      expect(testKpiUpdate).not.toBeNull();
    });

    test('Should create a KPI update (as field staff)', async () => {
      // Ensure a KPI exists
      if (!testKpi) {
        await loginAs(agent, adminUser.email, adminPassword);
        const createRes = await agent.post('/api/kpi/create').send(getValidKpiData());
        testKpi = await Kpi.findById(createRes.body.id);
      }
      await loginAs(agent, fieldUser.email, fieldPassword);
      const updateData = getValidKpiUpdateData();
      const res = await agent.put(`/api/kpi/update/${testKpi._id}`).send(updateData);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("KPI update saved successfully");
    });

    test('Should return 400 if required fields are missing in KPI update', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const incompleteUpdate = {
        project_id: testProjectId,
        task_id: new mongoose.Types.ObjectId().toHexString(),
        // Missing initial, final, updated_at
      };
      const res = await agent.put(`/api/kpi/update/${testKpi._id}`).send(incompleteUpdate);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Please give values for all the fields");
    });
  });

  describe('GET /api/kpi/getKpiUpdates/:kpi_id', () => {
    test('Should return 400 for an invalid KPI id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get('/api/kpi/getKpiUpdates/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid KPI ID");
    });

    test('Should return KPI updates for a valid KPI id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get(`/api/kpi/getKpiUpdates/${testKpi._id}`);
      expect(res.statusCode).toBe(200);
      // The response may return a message indicating no updates if none exist
      if (res.body.data) {
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });
  });

  describe('GET /api/kpi/getLatestKpiUpdate/:kpi_id', () => {
    test('Should return 400 for an invalid KPI id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get('/api/kpi/getLatestKpiUpdate/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid KPI ID");
    });

    test('Should return the latest KPI update for a valid KPI id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get(`/api/kpi/getLatestKpiUpdate/${testKpi._id}`);
      // If no KPI update exists, the route may return an error or a message.
      if (res.body.success) {
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        // If there is data, check that the most recent update is returned
        if (res.body.data.length > 0) {
          expect(new Date(res.body.data[0].updated_at)).toBeInstanceOf(Date);
        }
      } else {
        expect(res.body.message).toContain("No KPI updates found");
      }
    });
  });

  describe('GET /api/kpi/getKpiUpdatesForProject/:project_id', () => {
    test('Should return 400 for an invalid project id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get('/api/kpi/getKpiUpdatesForProject/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid project ID");
    });

    test('Should return KPI updates for a valid project id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get(`/api/kpi/getKpiUpdatesForProject/${testProjectId}`);
      expect(res.statusCode).toBe(200);
      // Depending on if KPI updates exist, check data accordingly
      if (res.body.data && Array.isArray(res.body.data)) {
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });
  });
});

describe('Unauthenticated Access to KPI Routes', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  test('POST /api/kpi/create should return 401 when not logged in', async () => {
    const res = await agent.post('/api/kpi/create').send(getValidKpiData());
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('GET /api/kpi/getKpis/:project_id should return 401 when not logged in', async () => {
    const res = await agent.get(`/api/kpi/getKpis/${testProjectId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('PUT /api/kpi/edit/:id should return 401 when not logged in', async () => {
    const dummyId = testKpi ? testKpi._id : 'dummyid';
    const res = await agent.put(`/api/kpi/edit/${dummyId}`).send({
      indicator: "x",
      what_it_tracks: "x",
      logframe_level: "x",
      baseline: 1,
      target: 2,
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('DELETE /api/kpi/delete/:id should return 401 when not logged in', async () => {
    const dummyId = testKpi ? testKpi._id : 'dummyid';
    const res = await agent.delete(`/api/kpi/delete/${dummyId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('PUT /api/kpi/update/:kpi_id should return 401 when not logged in', async () => {
    const dummyId = testKpi ? testKpi._id : 'dummyid';
    const res = await agent.put(`/api/kpi/update/${dummyId}`).send(getValidKpiUpdateData());
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
