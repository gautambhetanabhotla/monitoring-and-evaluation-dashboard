import express from 'express';
import { getClients, addUser,deleteUser, getUserDetails} from '../controllers/users.controller.js';
import { requireAuth,requireRole } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.get('/clients', requireAuth,requireRole(["admin"]), getClients);
userRouter.post('/add',requireAuth,requireRole(["admin"]), addUser);
userRouter.get('/getUser', getUserDetails);
userRouter.delete('/delete/:id',requireAuth,requireRole(["admin"]), deleteUser);

export default userRouter;