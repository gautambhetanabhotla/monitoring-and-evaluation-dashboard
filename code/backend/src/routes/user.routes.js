import express from 'express';
import { getClients, addUser } from '../controllers/users.controller.js';

const userRouter = express.Router();

userRouter.get('/clients', getClients);
userRouter.post('/add', addUser);

export default userRouter;