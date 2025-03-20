import { getProjectsByClientId, addProjectToClient,deleteProject,getProjectById} from "../controllers/projects.controller.js";
import { requireAuth,requireRole } from "../middleware/auth.middleware.js";
import express from "express";

const projectRouter = express.Router();

projectRouter.get("/get/:projectId",requireAuth,requireRole(["admin","client"]), getProjectById);
projectRouter.get("/getProjects",requireAuth,requireRole(["admin","client"]), getProjectsByClientId);
projectRouter.post("/addProject/:clientId",requireAuth,requireRole(["admin"]), addProjectToClient);
projectRouter.delete("/deleteProject/:projectId",requireAuth,requireRole(["admin"]), deleteProject);

export default projectRouter;