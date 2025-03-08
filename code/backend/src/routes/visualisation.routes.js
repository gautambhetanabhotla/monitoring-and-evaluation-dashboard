import { createVisualisation, getVisualisationsByProject,deleteVisualisation} from "../controllers/visualisation.controller.js";
import express from 'express';

const visualisationRouter = express.Router();

visualisationRouter.post('/save-visualisation', createVisualisation);
visualisationRouter.get('/get-visualisations/:project_id', getVisualisationsByProject);
visualisationRouter.delete('/delete-visualisation/:id', deleteVisualisation);

export default visualisationRouter;