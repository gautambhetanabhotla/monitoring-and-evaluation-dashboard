import express from 'express';
import { getUsers, addUser,deleteUser, getUserDetails, updatePassword} from '../controllers/users.controller.js';
import { requireAuth,requireRole } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.get('/clients', requireAuth,requireRole(["admin"]), getUsers);
userRouter.post('/add',requireAuth,requireRole(["admin"]), addUser);
userRouter.get('/getUser', getUserDetails);
userRouter.delete('/delete/:id',requireAuth,requireRole(["admin"]), deleteUser);
userRouter.patch('/updatepwd/:id', requireAuth, requireRole(["admin"]),updatePassword);

export default userRouter;