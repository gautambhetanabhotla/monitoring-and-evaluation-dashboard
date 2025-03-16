import express from 'express';
import { createTask, getTasksByProject, deleteTask} from '../controllers/task.controller.js';
import { requireAuth,requireRole } from '../middleware/auth.middleware.js';

const taskRouter = express.Router();

taskRouter.post('/create',requireAuth,requireRole(["admin"]), createTask);
taskRouter.get('/getTasks/:project_id',requireAuth, getTasksByProject);
taskRouter.delete('/delete/:id',requireAuth,requireRole(["admin"]), deleteTask);

export default taskRouter;