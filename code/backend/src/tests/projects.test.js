import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import process from 'process';

import projectRouter from '../routes/project.routes.js';
import authRouter from '../routes/auth.routes.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';

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
app.use('/api/projects', projectRouter);

jest.setTimeout(20000);

let adminUser;
let clientUser;
let testProject;
const adminPassword = 'password123';
const clientPassword = 'password123';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI, {});

  // Clean up any previous test data
  await User.deleteMany({
    email: { $in: ['admin@test.com', 'client@test.com', 'field@test.com', 'noproj@test.com'] },
  });
  await Project.deleteMany({ name: /Test Project/ });

  // Create admin user
  const adminHash = await bcrypt.hash(adminPassword, 10);
  adminUser = await User.create({
    email: 'admin@test.com',
    passwordHash: adminHash,
    role: 'admin',
    username: 'adminUser',
    phone_number: '1111111111',
  });

  // Create client user
  const clientHash = await bcrypt.hash(clientPassword, 10);
  clientUser = await User.create({
    email: 'client@test.com',
    passwordHash: clientHash,
    role: 'client',
    username: 'clientUser',
    phone_number: '2222222222',
    assigned_projects: []
  });

  // Create an initial project for testing GET by id and assignment
  testProject = await Project.create({
    name: 'Test Project 1',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    project_progress: 0,
    description: 'Initial test project'
  });

  // Assign the project to the client user
  clientUser.assigned_projects.push(testProject._id);
  await clientUser.save();
});

afterAll(async () => {
  await User.deleteMany({
    email: { $in: ['admin@test.com', 'client@test.com', 'field@test.com', 'noproj@test.com'] },
  });
  await Project.deleteMany({ name: /Test Project/ });
  await mongoose.connection.close();
});

// Helper function to login a user
const loginAs = async (agent, email, password) => {
  const res = await agent.post('/api/auth/login').send({ email, password });
  expect(res.statusCode).toBe(200);
  return res;
};

describe('Project Routes (Real Database)', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  afterEach(async () => {
    // Logout after each test
    await agent.post('/api/auth/logout');
  });

  describe('GET /api/projects/get/:projectId', () => {
    test('Should return a project when provided a valid projectId', async () => {
      // Log in as client user
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.get(`/api/projects/get/${testProject._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.project).toHaveProperty('_id', testProject._id.toString());
    });

    test('Should return 4004 if an invalid projectId format is provided', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.get(`/api/projects/get/invalidId`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid project ID');
    });
  });

  describe('GET /api/projects/getProjects', () => {
    test('Should return 400 when provided an invalid clientId query parameter', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.get('/api/projects/getProjects?clientId=invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid user ID');
    });

    test('Should return 404 when the user is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.get(`/api/projects/getProjects?clientId=${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });

    test('Should return 403 if the user role is "field staff"', async () => {
      // Create a field staff user
      const fieldHash = await bcrypt.hash('password123', 10);
      const fieldUser = await User.create({
        email: 'field@test.com',
        passwordHash: fieldHash,
        role: 'field staff',
        username: 'fieldUser',
        phone_number: '3333333333',
      });

      await loginAs(agent, fieldUser.email, 'password123');

      const res = await agent.get(`/api/projects/getProjects?clientId=${fieldUser._id.toString()}`);
      // The middleware destroys the session and returns 403 Forbidden if the role is unauthorized.
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Forbidden');

      await User.deleteOne({ _id: fieldUser._id });
    });

    test('Should return an empty project list if the user has no projects', async () => {
      // Create a client with no assigned projects
      await User.deleteOne({ phone_number: '4444444444' });
      const noProjHash = await bcrypt.hash('password123', 10);
      const noProjectClient = await User.create({
        email: 'noproj@test.com',
        passwordHash: noProjHash,
        role: 'client',
        username: 'noprojClient',
        phone_number: '4444444444',
        assigned_projects: []
      });

      await loginAs(agent, noProjectClient.email, 'password123');

      const res = await agent.get(`/api/projects/getProjects?clientId=${noProjectClient._id.toString()}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('No projects assigned to this user');
      expect(res.body.projects).toEqual([]);

      await User.deleteOne({ _id: noProjectClient._id });
    });

    test('Should return the assigned projects for a valid client', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.get(`/api/projects/getProjects?clientId=${clientUser._id.toString()}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects[0]).toHaveProperty('_id', testProject._id.toString());
    });
  });

  describe('POST /api/projects/addProject/:clientId', () => {
    const projectData = {
      name: 'Test Project Add',
      start_date: '2025-02-01',
      end_date: '2025-11-30',
      project_progress: 20,
      description: 'Project added via test'
    };

    test('Should return 400 if provided an invalid clientId', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.post('/api/projects/addProject/invalidId').send(projectData);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid user ID');
    });

    test('Should return 404 if the client user is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.post(`/api/projects/addProject/${fakeId}`).send(projectData);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });

    test('Should return 400 if the user role is not "client"', async () => {
      // Admin user should not have projects added
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.post(`/api/projects/addProject/${adminUser._id.toString()}`).send(projectData);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User cannot have projects');
    });

    test('Should return 400 if required fields are missing', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const incompleteData = { name: 'Incomplete Project' };
      const res = await agent.post(`/api/projects/addProject/${clientUser._id.toString()}`).send(incompleteData);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please enter all fields');
    });

    test('Should create a project and assign it to the client', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent
        .post(`/api/projects/addProject/${clientUser._id.toString()}`)
        .send(projectData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Project created successfully under');
      expect(res.body.id).toBeDefined();

      // Verify the client now has the project in assigned_projects
      const updatedClient = await User.findById(clientUser._id);
      expect(updatedClient.assigned_projects.map(p => p.toString())).toContain(res.body.id);
    });
  });

  describe('DELETE /api/projects/deleteProject/:projectId', () => {
    let projectToDelete;
    beforeAll(async () => {
      // Create a project specifically for deletion testing.
      projectToDelete = await Project.create({
        name: 'Test Project Delete',
        start_date: '2025-03-01',
        end_date: '2025-10-31',
        project_progress: 50,
        description: 'Project to be deleted'
      });
    });

    test('Should return 400 for an invalid projectId', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.delete('/api/projects/deleteProject/invalidId');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid project ID');
    });

    test('Should return 404 if the project does not exist', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const fakeId = new mongoose.Types.ObjectId().toHexString();

      const res = await agent.delete(`/api/projects/deleteProject/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Project not found');
    });

    test('Should delete the project successfully when provided a valid projectId', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.delete(`/api/projects/deleteProject/${projectToDelete._id.toString()}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Project deleted successfully');

      // Ensure the project is actually removed from the DB
      const found = await Project.findById(projectToDelete._id);
      expect(found).toBeNull();
    });
  });
});

describe('Unauthenticated Access', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  test('GET /api/projects/get/:projectId should return 401 when not logged in', async () => {
    const res = await agent.get(`/api/projects/get/${testProject._id}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });

  test('GET /api/projects/getProjects should return 401 when not logged in', async () => {
    const res = await agent.get('/api/projects/getProjects?clientId=' + clientUser._id.toString());
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });

  test('POST /api/projects/addProject/:clientId should return 401 when not logged in', async () => {
    const projectData = {
      name: 'Test Project Unauth',
      start_date: '2025-02-01',
      end_date: '2025-11-30',
      project_progress: 20,
      description: 'Project added via unauthenticated test'
    };

    const res = await agent.post(`/api/projects/addProject/${clientUser._id.toString()}`).send(projectData);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });

  test('DELETE /api/projects/deleteProject/:projectId should return 401 when not logged in', async () => {
    const res = await agent.delete(`/api/projects/deleteProject/${testProject._id.toString()}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });
});
