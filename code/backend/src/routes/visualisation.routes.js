import { createVisualisation,
         getVisualisationsByProject,
         deleteVisualisation,
         updateVisualisation} from "../controllers/visualisation.controller.js";
import { getKpiUpdatesAsData, getKpisByProject } from "../controllers/kpi.controller.js";
import { requireAuth,requireRole } from "../middleware/auth.middleware.js";

import express from 'express';

const visualisationRouter = express.Router();

visualisationRouter.post('/save-visualisation',requireAuth,requireRole(["admin"]), createVisualisation);
visualisationRouter.get('/get-visualisations/:project_id',requireAuth, getVisualisationsByProject);
visualisationRouter.delete('/delete-visualisation/:id',requireAuth,requireRole(["admin"]), deleteVisualisation);
visualisationRouter.put('/update-visualisation/:id',requireAuth,requireRole(["admin"]), updateVisualisation);
visualisationRouter.get('/get-KpibyProject/:project_id',requireAuth,getKpisByProject );
visualisationRouter.get('/get-kpi-updates-as-data/:kpi_id',requireAuth, getKpiUpdatesAsData);

export default visualisationRouter;