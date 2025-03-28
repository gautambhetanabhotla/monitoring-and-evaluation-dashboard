import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import visualisationRouter from '../routes/visualisation.routes.js';
import authRouter from '../routes/auth.routes.js';
import User from '../models/User.model.js';
import Visualisation from '../models/Visualisation.model.js';
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
app.use('/api/visualisation', visualisationRouter);

jest.setTimeout(20000);

let adminUser;
let normalUser; // a non-admin user for testing role restrictions
let testProjectId; // dummy project id, assigned in beforeAll
let testVisualisation;
const adminPassword = 'password123';
const userPassword = 'password123';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI, {});

  // Clean up previous test data
  await User.deleteMany({
    email: { $in: ['admin@vis.com', 'user@vis.com', 'field@vis.com'] },
  });
  await Visualisation.deleteMany({ title: /Test Visualisation/ });
  await KpiUpdate.deleteMany({});

  // Create an admin user
  const adminHash = await bcrypt.hash(adminPassword, 10);
  adminUser = await User.create({
    email: 'admin@vis.com',
    passwordHash: adminHash,
    role: 'admin',
    username: 'adminVis',
    phone_number: '1111111111',
  });

  // Create a normal user for testing unauthorized access
  const userHash = await bcrypt.hash(userPassword, 10);
  normalUser = await User.create({
    email: 'user@vis.com',
    passwordHash: userHash,
    role: 'client',
    username: 'clientVis',
    phone_number: '2222222222',
  });

  // Create a dummy project id (assume project exists in your system)
  testProjectId = new mongoose.Types.ObjectId().toHexString();
});

afterAll(async () => {
  await User.deleteMany({
    email: { $in: ['admin@vis.com', 'user@vis.com', 'field@vis.com'] },
  });
  await Visualisation.deleteMany({ title: /Test Visualisation/ });
  await KpiUpdate.deleteMany({});
  await mongoose.connection.close();
});

// Helper function to login a user
const loginAs = async (agent, email, password) => {
  const res = await agent.post('/api/auth/login').send({ email, password });
  expect(res.statusCode).toBe(200);
  return res;
};

// Factory function to generate valid visualisation data after testProjectId is defined
const getValidData = () => ({
  project_id: testProjectId,
  file: { data: "sampledata" },
  title: "Test Visualisation Create",
  type: "bar",
  component_1: "X-axis",
  component_2: "Y-axis",
  columns: ["col1", "col2"],
  category: "file", // Using 'file' category so file is required
  width: 500,
  height: 300,
});

describe('Visualisation Routes (Real Database)', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  afterEach(async () => {
    // Logout after each test (if applicable)
    await agent.post('/api/auth/logout');
  });

  describe('POST /api/visualisation/save-visualisation', () => {
    test('Should create a visualisation when all required fields are provided (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const validData = getValidData();

      const res = await agent.post('/api/visualisation/save-visualisation').send(validData);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Visualisation saved successfully");
      expect(res.body).toHaveProperty('id');

      testVisualisation = await Visualisation.findById(res.body.id);
    });

    test('Should return 400 if required fields are missing', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const incompleteData = {
        project_id: testProjectId,
        file: { data: "sampledata" },
        title: "Test Visualisation Incomplete",
      };

      const res = await agent.post('/api/visualisation/save-visualisation').send(incompleteData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Please give values for all the fields");
    });

    test('Should return 403 if a non-admin user attempts to create a visualisation', async () => {
      await loginAs(agent, normalUser.email, userPassword);
      const validData = getValidData();
      const res = await agent.post('/api/visualisation/save-visualisation').send(validData);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });

  describe('GET /api/visualisation/get-visualisations/:project_id', () => {
    test('Should return 400 for invalid project_id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get('/api/visualisation/get-visualisations/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid project ID");
    });

    test('Should return 200 and visualisations for a valid project_id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get(`/api/visualisation/get-visualisations/${testProjectId}`);
      if (res.body.success) {
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
      } else {
        expect(res.body.message).toContain("No visualisations found for this project");
      }
    });
  });

  describe('PUT /api/visualisation/update-visualisation/:id', () => {
    const updateData = {
      file: { data: "updatedData" },
      title: "Test Visualisation Updated",
      type: "line",
      component_1: "Updated X",
      component_2: "Updated Y",
      columns: ["colA", "colB"],
      category: "file",
      width: 600,
      height: 400,
    };

    test('Should update an existing visualisation (as admin)', async () => {
      if (!testVisualisation) {
        await loginAs(agent, adminUser.email, adminPassword);
        const createRes = await agent
          .post('/api/visualisation/save-visualisation')
          .send(getValidData());
        testVisualisation = await Visualisation.findById(createRes.body.id);
      }
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.put(`/api/visualisation/update-visualisation/${testVisualisation._id}`).send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("Visualisation updated successfully");

      const updatedVis = await Visualisation.findById(testVisualisation._id);
      expect(updatedVis.title).toBe("Test Visualisation Updated");
    });

    test('Should return 400 if required fields are missing during update', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const incompleteUpdate = {
        file: { data: "updatedData" },
        title: "Incomplete Update",
        // Missing type, component_1, component_2, columns, category
      };

      const res = await agent.put(`/api/visualisation/update-visualisation/${testVisualisation._id}`).send(incompleteUpdate);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Please give values for all the fields");
    });
  });

  describe('DELETE /api/visualisation/delete-visualisation/:id', () => {
    let visToDelete;
    beforeAll(async () => {
      visToDelete = await Visualisation.create({
        project_id: testProjectId,
        file: { data: "deleteTest" },
        title: "Test Visualisation Delete",
        type: "pie",
        component_1: "Comp1",
        component_2: "Comp2",
        columns: ["colX"],
        category: "file",
        width: 400,
        height: 300,
      });
    });

    test('Should return 400 for an invalid visualisation id', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.delete('/api/visualisation/delete-visualisation/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid visualisation ID");
    });

    test('Should return 404 if visualisation does not exist', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await agent.delete(`/api/visualisation/delete-visualisation/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Visualisation not found");
    });

    test('Should delete a visualisation when provided a valid id (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.delete(`/api/visualisation/delete-visualisation/${visToDelete._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Visualisation deleted successfully");

      const found = await Visualisation.findById(visToDelete._id);
      expect(found).toBeNull();
    });

    test('Should return 403 if a non-admin user attempts to delete a visualisation', async () => {
      const newVis = await Visualisation.create({
        project_id: testProjectId,
        file: { data: "deleteTest2" },
        title: "Test Visualisation Delete Non-Admin",
        type: "scatter",
        component_1: "C1",
        component_2: "C2",
        columns: ["colY"],
        category: "file",
        width: 400,
        height: 300,
      });
      await loginAs(agent, normalUser.email, userPassword);
      const res = await agent.delete(`/api/visualisation/delete-visualisation/${newVis._id}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });
});

describe('Unauthenticated Access to Visualisation Routes', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  test('POST /api/visualisation/save-visualisation should return 401 when not logged in', async () => {
    const data = {
      project_id: testProjectId,
      file: { data: "unauth" },
      title: "Unauth Visualisation",
      type: "bar",
      component_1: "X",
      component_2: "Y",
      columns: ["col1"],
      category: "file",
      width: 300,
      height: 200,
    };

    const res = await agent.post('/api/visualisation/save-visualisation').send(data);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('GET /api/visualisation/get-visualisations/:project_id should return 401 when not logged in', async () => {
    const res = await agent.get(`/api/visualisation/get-visualisations/${testProjectId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('PUT /api/visualisation/update-visualisation/:id should return 401 when not logged in', async () => {
    const res = await agent
      .put(`/api/visualisation/update-visualisation/${testVisualisation ? testVisualisation._id : 'dummyid'}`)
      .send({ file: { data: "x" }, title: "x", type:"bar", component_1:"x", component_2:"x", columns:["x"], category:"file", width:100, height:100 });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('DELETE /api/visualisation/delete-visualisation/:id should return 401 when not logged in', async () => {
    const res = await agent.delete(`/api/visualisation/delete-visualisation/${testVisualisation ? testVisualisation._id : 'dummyid'}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
