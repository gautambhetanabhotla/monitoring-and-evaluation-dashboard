import express from 'express';
import { getClients, addUser, getUser,deleteUser} from '../controllers/users.controller.js';

const userRouter = express.Router();

userRouter.get('/clients', getClients);
userRouter.post('/add', addUser);
userRouter.get('/getDetails/:id', getUser);
userRouter.delete('/delete/:id', deleteUser);

export default userRouter;