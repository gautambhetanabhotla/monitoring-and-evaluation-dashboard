import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import userRouter from '../routes/user.routes.js';
import authRouter from '../routes/auth.routes.js';
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

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

jest.setTimeout(20000);

let adminUser;
let clientUser; // a non-admin user
const adminPassword = 'password123';
const clientPassword = 'password123';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI, {});

  // Clean up previous test data
  await User.deleteMany({
    email: { $in: ['admin@test.com', 'client@test.com', 'newuser@test.com'] },
  });

  // Create an admin user
  const adminHash = await bcrypt.hash(adminPassword, 10);
  adminUser = await User.create({
    email: 'admin@test.com',
    passwordHash: adminHash,
    role: 'admin',
    username: 'adminUser',
    phone_number: '1111111111',
  });

  // Create a client user (non-admin)
  const clientHash = await bcrypt.hash(clientPassword, 10);
  clientUser = await User.create({
    email: 'client@test.com',
    passwordHash: clientHash,
    role: 'client',
    username: 'clientUser',
    phone_number: '2222222222',
  });
});

afterAll(async () => {
  await User.deleteMany({
    email: { $in: ['admin@test.com', 'client@test.com', 'newuser@test.com'] },
  });
  await mongoose.connection.close();
});

const loginAs = async (agent, email, password) => {
  const res = await agent.post('/api/auth/login').send({ email, password });
  expect(res.statusCode).toBe(200);
  return res;
};

describe('User Routes (Real Database)', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  afterEach(async () => {
    // Logout if applicable
    await agent.post('/api/auth/logout');
  });

  describe('GET /api/users/clients', () => {
    test('Should return clients for admin users', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.get('/api/users/clients');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.clients)).toBe(true);
      // All returned users should have role 'client'
      res.body.clients.forEach(client => {
        expect(client.role).toBe('client');
        expect(client).not.toHaveProperty('passwordHash');
      });
    });

    test('Should return 403 if non-admin tries to access clients', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.get('/api/users/clients');
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });

  describe('POST /api/users/add', () => {
    const validUserData = {
      username: "newUser",
      email: "newuser@test.com",
      password: "newpassword",
      role: "client",
      phone_number: "3333333333",
    };

    test('Should add a new user when all required fields are provided (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.post('/api/users/add').send(validUserData);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("User added successfully");
      expect(res.body).toHaveProperty('id');
    });

    test('Should return 400 if required fields are missing', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const incompleteData = {
        username: "newUser2",
        email: "newuser2@test.com",
        // missing password and phone_number
      };

      const res = await agent.post('/api/users/add').send(incompleteData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Please enter all fields");
    });

    test('Should return 403 if non-admin user attempts to add a user', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.post('/api/users/add').send(validUserData);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });
  });

  describe('GET /api/users/getUser', () => {
    test('Should return user details for an authenticated user', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.get('/api/users/getUser');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(clientUser.email.toLowerCase());
    });

    test('Should return 401 if not logged in', async () => {
      const res = await agent.get('/api/users/getUser');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Not authenticated");
    });
  });

  describe('DELETE /api/users/delete/:id', () => {
    let userToDelete;

    beforeEach(async () => {
      // Clean any previous test user
      await User.deleteOne({ username: "deleteUser" });
      userToDelete = await User.create({
        username: "deleteUser",
        email: "deleteuser@test.com",
        passwordHash: bcrypt.hashSync("password", 10),
        role: "client",
        phone_number: "4444444444",
      });
    });

    test('Should delete a user when provided a valid id (as admin)', async () => {
      await loginAs(agent, adminUser.email, adminPassword);

      const res = await agent.delete(`/api/users/delete/${userToDelete._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");

      const found = await User.findById(userToDelete._id);
      expect(found).toBeNull();
    });

    test('Should return 403 if non-admin tries to delete a user', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const res = await agent.delete(`/api/users/delete/${userToDelete._id}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Forbidden");
    });

    test('Should return 404 if user does not exist', async () => {
      await loginAs(agent, adminUser.email, adminPassword);
      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await agent.delete(`/api/users/delete/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe('PATCH /api/users/updatepwd/:id', () => {
    // Reset client password before each test in this block
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash(clientPassword, 10);
      await User.findByIdAndUpdate(clientUser._id, { passwordHash });
    });

    test('Should update a user password when provided valid data (authenticated)', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const newPassword = "updatedPassword";
      const res = await agent
        .patch(`/api/users/updatepwd/${clientUser._id}`)
        .send({ pwd: newPassword });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Re-fetch the user and check that the password has been updated (by comparing hash)
      const updatedUser = await User.findById(clientUser._id);
      const isMatch = bcrypt.compareSync(newPassword, updatedUser.passwordHash);
      expect(isMatch).toBe(true);
    });

    test('Should return 404 if user does not exist for password update', async () => {
      await loginAs(agent, clientUser.email, clientPassword);

      const fakeId = new mongoose.Types.ObjectId().toHexString();
      const res = await agent.patch(`/api/users/updatepwd/${fakeId}`).send({ pwd: "somepwd" });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

    test('Should return 401 if not authenticated while updating password', async () => {
      const res = await agent.patch(`/api/users/updatepwd/${clientUser._id}`).send({ pwd: "somepwd" });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });
});

describe('Unauthenticated Access to User Routes', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  test('GET /api/users/clients should return 401 when not logged in', async () => {
    const res = await agent.get('/api/users/clients');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('POST /api/users/add should return 401 when not logged in', async () => {
    const res = await agent.post('/api/users/add').send({
      username: "unauthUser",
      email: "unauth@test.com",
      password: "pass",
      role: "client",
      phone_number: "5555555555",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('GET /api/users/getUser should return 401 when not logged in', async () => {
    const res = await agent.get('/api/users/getUser');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authenticated");
  });

  test('DELETE /api/users/delete/:id should return 401 when not logged in', async () => {
    const res = await agent.delete(`/api/users/delete/${adminUser._id}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  test('PATCH /api/users/updatepwd/:id should return 401 when not logged in', async () => {
    const res = await agent.patch(`/api/users/updatepwd/${adminUser._id}`).send({ pwd: "x" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
