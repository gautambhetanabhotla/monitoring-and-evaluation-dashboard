import express from "express";
import { createKpi, getKpisByProject, deleteKpi, updateKpi
        , getKpiUpdatesbyKpi, getLatestKpiUpdate
} from "../controllers/kpi.controller.js";
import { requireAuth,requireRole } from "../middleware/auth.middleware.js";

const kpiRouter = express.Router();

kpiRouter.post('/create',requireAuth,requireRole(["admin"]), createKpi);
kpiRouter.get('/getKpis/:project_id',requireAuth, getKpisByProject);
kpiRouter.delete('/delete/:id',requireAuth,requireRole(["admin"]), deleteKpi);
kpiRouter.put('/update/:kpi_id',requireAuth,requireRole(["admin","field staff"]), updateKpi);
kpiRouter.get('/getKpiUpdates/:kpi_id',requireAuth, getKpiUpdatesbyKpi);
kpiRouter.get('/getLatestKpiUpdate/:kpi_id',requireAuth, getLatestKpiUpdate);

export default kpiRouter;