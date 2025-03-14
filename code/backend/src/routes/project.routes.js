import { getProjectsByClientId, addProjectToClient,deleteProject} from "../controllers/projects.controller.js";
import express from "express";

const projectRouter = express.Router();

projectRouter.get("/getProjects", getProjectsByClientId);
projectRouter.post("/addProject/:clientId", addProjectToClient);
projectRouter.delete("/deleteProject/:projectId", deleteProject);

export default projectRouter;