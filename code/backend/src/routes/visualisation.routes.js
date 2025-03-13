import { createVisualisation,
         getVisualisationsByProject,
         deleteVisualisation,
         updateVisualisation} from "../controllers/visualisation.controller.js";
import express from 'express';

const visualisationRouter = express.Router();

visualisationRouter.post('/save-visualisation', createVisualisation);
visualisationRouter.get('/get-visualisations/:project_id', getVisualisationsByProject);
visualisationRouter.delete('/delete-visualisation/:id', deleteVisualisation);
visualisationRouter.put('/update-visualisation/:id', updateVisualisation);

export default visualisationRouter;