import Kpi from "../models/Kpi.model.js";
import KpiUpdate from "../models/KpiUpdate.model.js";

export const createKpi = async (req, res) => {
    const {project_id, indicator, what_it_tracks, 
        logframe_level, explanation, baseline, target} = req.body;
    
    if (!project_id || !indicator || !what_it_tracks || 
        !logframe_level || !explanation || !baseline || !target) {
        return res.status(400).json({ success: false, message: "Please give values for all the fields" });
    }

    const kpi = new Kpi({ project_id, indicator, what_it_tracks, 
        logframe_level, explanation, baseline, target});

    try {
        const newKpi = await kpi.save();
        return res.status(201).json({message : "KPI saved successfully",newKpi});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteKpi = async (req, res) => {
    const { id } = req.params;
    try {
        const kpi = await Kpi.findByIdAndDelete(id);
        if (!kpi) {
            return res.status(404).json({ success : false , message: "KPI not found" });
        }
        return res.status(200).json({ success : true , message: "KPI deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success : false ,message: error.message });
    }
};

export const getKpisByProject = async (req, res) => {
    const { project_id } = req.params;

    try {
        if(!mongoose.Types.ObjectId.isValid(project_id)){
            return res.status(400).json({ success : false , message: "Invalid project ID" });
        }

        const kpis = await Kpi.find({ project_id });
        if(kpis.length === 0){
            return res.status(400).json({ success : false , message: "No KPIs found for this project" });
        }1

        return res.status(200).json({success : true, message : `KPIs fetched successfully`, data : kpis});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateKpi = async (req, res) => {
    const {kpi_id} = req.params;
    const {task_id,initial,final,updated_at,note,updated_by} = req.body;

    if(!task_id || !initial || !final || !updated_at || !updated_by){
        return res.status(400).json({ success: false, message: "Please give values for all the fields" });
    }

    try {
        const kpiUpdate = new KpiUpdate({task_id,kpi_id,initial,final,updated_at,note,updated_by});
        const newKpiUpdate = await kpiUpdate.save();
        return res.status(201).json({message : "KPI update saved successfully",newKpiUpdate});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getKpiUpdatesbyKpi = async (req, res) => {
    const { kpi_id } = req.params;

    try {
        if(!mongoose.Types.ObjectId.isValid(kpi_id)){
            return res.status(400).json({ success : false , message: "Invalid KPI ID" });
        }

    const kpiUpdates = await KpiUpdate.find({ kpi_id });

    if(kpiUpdates.length === 0){
        return res.status(400).json({ success : false , message: "No KPI updates found for this KPI" });
    }

    return res.status(200).json({success : true, message : `KPI updates fetched successfully`, data : kpiUpdates});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getLatestKpiUpdate = async (req, res) => {
    const { kpi_id } = req.params;

    try {
        if(!mongoose.Types.ObjectId.isValid(kpi_id)){
            return res.status(400).json({ success : false , message: "Invalid KPI ID" });
        }

    const latestKpiUpdate = await KpiUpdate.find({ kpi_id }).sort({updated_at: -1}).limit(1);

    if(!latestKpiUpdate){
        return res.status(400).json({ success : false , message: "No KPI updates found for this KPI" });
    }    

    return res.status(200).json({success : true, message : `Last KPI update fetched successfully`, data : latestKpiUpdate});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteKpiUpdate = async (req, res) => {
    const { id } = req.params;
    try {
        const kpiUpdate = await KpiUpdate.findByIdAndDelete(id);
        if (!kpiUpdate) {
            return res.status(404).json({ success : false , message: "KPI update not found" });
        }
        return res.status(200).json({ success : true , message: "KPI update deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success : false ,message: error.message });
    }
};

export const getKpiUpdatesAsData = async (req, res) => {
    const { kpi_id } = req.params;
    try {
        if(!mongoose.Types.ObjectId.isValid(kpi_id)){
            return res.status(400).json({ success : false , message: "Invalid KPI ID" });
        }

        const kpiUpdates = await KpiUpdate.find({ kpi_id });

        if(kpiUpdates.length === 0){
            return res.status(400).json({ success : false , message: "No KPI updates found for this KPI" });
        }

        const data = kpiUpdates.map(kpiUpdate => ({ DateTime : kpiUpdate.updated_at, Value : kpiUpdate.final }));

        return res.status(200).json({success : true, message : `KPI updates fetched successfully`, data : data});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}