import { createVisualisation,
         getVisualisationsByProject,
         deleteVisualisation,
         updateVisualisation} from "../controllers/visualisation.controller.js";
import { requireAuth,requireRole } from "../middleware/auth.middleware.js";
import express from 'express';

const visualisationRouter = express.Router();

visualisationRouter.post('/save-visualisation',requireAuth,requireRole(["admin"]), createVisualisation);
visualisationRouter.get('/get-visualisations/:project_id',requireAuth, getVisualisationsByProject);
visualisationRouter.delete('/delete-visualisation/:id',requireAuth,requireRole(["admin"]), deleteVisualisation);
visualisationRouter.put('/update-visualisation/:id',requireAuth,requireRole(["admin"]), updateVisualisation);

export default visualisationRouter;