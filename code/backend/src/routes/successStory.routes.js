import { createSuccessStory, 
    getSuccessStoriesByProject, 
    deleteSuccessStory, 
    updateSuccessStory } from "../controllers/successStory.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

import express from 'express';

const successStoryRouter = express.Router();

successStoryRouter.post('/save-success-story', requireAuth, requireRole(["admin"]), createSuccessStory);
successStoryRouter.get('/get-success-stories/:projectid', requireAuth, getSuccessStoriesByProject);
successStoryRouter.delete('/delete-success-story/:id', requireAuth, requireRole(["admin"]), deleteSuccessStory);
successStoryRouter.put('/update-success-story/:id', requireAuth, requireRole(["admin"]), updateSuccessStory);

export default successStoryRouter;
