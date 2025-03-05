import express from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/logout', authMiddleware, logout);

export default authRouter;
