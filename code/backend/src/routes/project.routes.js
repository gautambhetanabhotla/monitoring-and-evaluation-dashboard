import { getProjectsByClientId, addProjectToClient,deleteProject} from "../controllers/projects.controller.js";
import { requireAuth,requireRole } from "../middleware/auth.middleware.js";
import express from "express";

const projectRouter = express.Router();

projectRouter.get("/getProjects",requireAuth,requireRole(["admin","client"]), getProjectsByClientId);
projectRouter.post("/addProject/:clientId",requireAuth,requireRole(["admin"]), addProjectToClient);
projectRouter.delete("/deleteProject/:projectId",requireAuth,requireRole(["admin"]), deleteProject);

export default projectRouter;