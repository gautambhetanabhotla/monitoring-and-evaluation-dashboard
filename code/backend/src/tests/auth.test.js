import request from 'supertest';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import authRouter from '../routes/auth.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Session middleware setup
app.use(
  session({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);

app.use('/api/auth', authRouter);

jest.setTimeout(20000); 

let testUser; 

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI ,{});
  await User.deleteOne({ email: 'test@example.com' });

  const passwordHash = await bcrypt.hash('password123', 10);
  testUser = await User.create({
    email: 'test@example.com',
    passwordHash,
    role: 'admin',
    username: 'admin1',
    phone_number: '1234567890',
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication Tests (Real Database)', () => {
  let agent;
  beforeEach(() => {
    agent = request.agent(app);
  });

  test('Login with correct credentials', async () => {
    const res = await agent.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123', 
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User logged in successfully');
    expect(res.body.role).toBe(testUser.role);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('Login with incorrect password', async () => {
    const res = await agent.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  test('Login with non-existent user', async () => {
    const res = await agent.post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User does not exist');
  });

  test('Logout after login', async () => {
    await agent.post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await agent.post('/api/auth/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User logged out successfully');
  });

  test('Logout without login should fail', async () => {
    const res = await agent.post('/api/auth/logout');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unauthorized');
  });
});
