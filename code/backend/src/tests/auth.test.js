import request from 'supertest';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import authRouter from '../routes/auth.routes.js';

const app = express();
app.use(express.json());

jest.setTimeout(20000); // 20 seconds


// Session middleware setup
app.use(session({
    secret: 'testsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
}));

app.use('/auth', authRouter);

let testUser; // ✅ Track test user

beforeAll(async () => {
    await mongoose.connect('mongodb+srv://pallamreddyviswas:7G4h7FIrUxSt8RiF@cluster0.lzcvb.mongodb.net/Test?retryWrites=true&w=majority&appName=Cluster0')
    // Ensure test user does not already exist
    await User.deleteOne({ email: 'test@example.com' });

    const passwordHash = await bcrypt.hash('password123', 10);
    testUser = await User.create({
        email: 'test@example.com',
        passwordHash : 'password123',
        role: 'admin',
        username : 'admin1',
        phone_number : '1234567890',
    });
});

// afterEach(async () => {
//     if (testUser) {
//         await User.deleteOne({ _id: testUser._id }); // ✅ Corrected deletion
//     }
// });

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Authentication Tests (Real Database)', () => {
    let agent;

    beforeEach(() => {
        agent = request.agent(app); // Maintain session across requests
    });

    test('Login with correct credentials', async () => {
        const res = await agent.post('/auth/login').send({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User logged in successfully");
    });

    test('Login with incorrect password', async () => {
        const res = await agent.post('/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Invalid credentials");
    });

    test('Login with non-existent user', async () => {
        const res = await agent.post('/auth/login').send({
            email: 'notfound@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("User does not exist");
    });

    test('Logout after login', async () => {
        await agent.post('/auth/login').send({
            email: 'test@example.com',
            password: 'password123',
        });

        const res = await agent.post('/auth/logout');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User logged out successfully");
    });

    test('Logout without login should fail', async () => {
        const res = await agent.post('/auth/logout');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Not authorized to access this route");
    });
});
