// task.test.js
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import taskRouter from '../routes/task.routes.js';
import authRouter from '../routes/auth.routes.js';
import Task from '../models/Task.model.js';
import User from '../models/User.model.js';

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

// Mount the authentication and task routes
app.use('/api/auth', authRouter);
app.use('/api/task', taskRouter);

jest.setTimeout(20000);

let adminUser;
let normalUser;
let testProjectId; // dummy project id for testing
let testTask; // store a created task for later tests

const adminPassword = 'password123';
const userPassword = 'password123';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI, {});

  // Clean up any previous test data
  await User.deleteMany({
    email: { $in: ['admin@task.com', 'user@task.com'] },
  });
  await Task.deleteMany({});

  // Create an admin user
  const adminHash = await bcrypt.hash(adminPassword, 10);
  adminUser = await User.create({
    email: 'admin@task.com',
    passwordHash: adminHash,
    role: 'admin',
    username: 'adminTask',
    phone_number: '1111111111',
  });

  // Create a normal (non-admin) user
  const userHash = await bcrypt.hash(userPassword, 10);
  normalUser = await User.create({
    email: 'user@task.com',
    passwordHash: userHash,
    role: 'client',
    username: 'clientTask',
    phone_number: '2222222222',
  });

  // Create a dummy project id (assumed to be valid in your system)
  testProjectId = new mongoose.Types.ObjectId().toHexString();
});

afterAll(async () => {
  await User.deleteMany({
    email: { $in: ['admin@task.com', 'user@task.com'] },
  });
  await Task.deleteMany({});
  await mongoose.connection.close();
});

// Helper function to login a user using the auth route
const loginAs = async (agent, email, password) => {
  const res = await agent.post('/api/auth/login').send({ email, password });
  expect(res.statusCode).toBe(200);
};

describe('Task Routes', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  afterEach(async () => {
    // Logout after each test if applicable
    await agent.post('/api/auth/logout');
  });

  describe('POST /api/task/create', () => {
    test('Should create a task when required fields are provided (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const validData = {
        project_id: testProjectId,
        title: 'Test Task',
        description: 'Task description',
      };

      const res = await agent.post('/api/task/create').send(validData);
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Task saved successfully");
      expect(res.body).toHaveProperty('id');

      testTask = await Task.findById(res.body.id);
      expect(testTask).not.toBeNull();
    });

    test('Should return 400 if required fields are missing', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const incompleteData = {
        project_id: testProjectId,
        description: 'Missing title field',
      };

      const res = await agent.post('/api/task/create').send(incompleteData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Project ID and title are required");
    });

    test('Should return 403 if a non-admin user attempts to create a task', async () => {
      await loginAs(agent, normalUser.email, userPassword);
      const validData = {
        project_id: testProjectId,
        title: 'Test Task',
        description: 'Task description',
      };

      const res = await agent.post('/api/task/create').send(validData);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });

  describe('GET /api/task/getTasks/:project_id', () => {
    test('Should return 400 for an invalid project ID', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.get('/api/task/getTasks/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid project ID");
    });

    test('Should return tasks for a valid project ID', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      // Create an extra task to ensure data is returned
      await Task.create({
        project_id: testProjectId,
        title: 'Another Task',
        description: 'Another description',
      });
      const res = await agent.get(`/api/task/getTasks/${testProjectId}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/task/delete/:id', () => {
    let taskToDelete;
    beforeEach(async () => {
      // Create a task for deletion testing
      taskToDelete = await Task.create({
        project_id: testProjectId,
        title: 'Task to Delete',
        description: 'This task will be deleted',
      });
    });

    test('Should return 404 if task does not exist', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await agent.delete(`/api/task/delete/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Task not found");
    });

    test('Should delete a task when a valid id is provided (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const res = await agent.delete(`/api/task/delete/${taskToDelete._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Task deleted successfully");

      const found = await Task.findById(taskToDelete._id);
      expect(found).toBeNull();
    });

    test('Should return 403 if a non-admin user attempts to delete a task', async () => {
      const taskForNonAdmin = await Task.create({
        project_id: testProjectId,
        title: 'Task for Non-Admin',
        description: 'Test deletion by non-admin',
      });
      await loginAs(agent, normalUser.email, userPassword);
      const res = await agent.delete(`/api/task/delete/${taskForNonAdmin._id}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });
});

describe('Unauthenticated Access to Task Routes', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  test('POST /api/task/create should return 401 when not logged in', async () => {
    const validData = {
      project_id: testProjectId,
      title: 'Test Task',
      description: 'Task description',
    };

    const res = await agent.post('/api/task/create').send(validData);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('GET /api/task/getTasks/:project_id should return 401 when not logged in', async () => {
    const res = await agent.get(`/api/task/getTasks/${testProjectId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('DELETE /api/task/delete/:id should return 401 when not logged in', async () => {
    const dummyId = testTask ? testTask._id : 'dummyid';
    const res = await agent.delete(`/api/task/delete/${dummyId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
