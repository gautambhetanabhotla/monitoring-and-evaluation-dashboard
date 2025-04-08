// backend/routes/auth.routes.js
import express from 'express';
import { login, logout, getCurrentUser } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/logout', requireAuth, logout);
authRouter.get('/me', getCurrentUser);

export default authRouter;
