import mongoose from 'mongoose';
import Visualisation from '../models/Visualisation.model.js';
import KpiUpdate from '../models/KpiUpdate.model.js';

// Create a new visualisation
export const createVisualisation = async (req, res) => {
    const {project_id,title,file, type, component_1,component_2,columns,category,kpi_id=null,width=0,height=0 } = req.body;

    if (!project_id || !file || !title || !type || !component_1 || !component_2 || !columns || !category) {
        return res.status(400).json({ success:false, message: "Please give values for all the fields" });
    }

    const visualisation = new Visualisation({
        project_id,
        file,
        title,
        type,
        component_1,
        component_2,
        columns,
        category,
        kpi_id,
        width,
        height
    });

    // console.log(visualisation);

    try {
        const newVisualisation = await visualisation.save();
        console.log("Visualisation saved successfully");
        return res.status(201).json({message : "Visualisation saved successfully",id: newVisualisation._id});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get all visualisations based on project
export const getVisualisationsByProject = async (req, res) => {
    const { project_id } = req.params;

    try {
        if(!mongoose.Types.ObjectId.isValid(project_id)){
            return res.status(400).json({ success : false , message: "Invalid project ID" });
        }

        const visualisations = await Visualisation.find({ project_id });
        // if category is KPI, then get all KPI updates based on KPI id and 
        // map then as {DateTime : kpiUpdate.updated_at, Value : kpiUpdate.final} and store it as file in visualisation

        if (visualisations.length === 0) {
            return res.status(200).json({ success : false , message: "No visualisations found for this project" });
        }

        for (let i = 0; i < visualisations.length; i++) {
            if (visualisations[i].category === "KPI") {
                const kpiUpdates = await KpiUpdate.find({ kpi_id: visualisations[i].kpi_id });
                if (kpiUpdates.length === 0) {
                    return res.status(400).json({ success : false , message: "No KPI updates found for this KPI" });
                }
                visualisations[i].file = JSON.stringify(kpiUpdates.map(kpiUpdate => ({ DateTime : kpiUpdate.updated_at, Value : kpiUpdate.final })));
            }
        }

        console.log("Visualisations fetched successfully");

        return res.status(200).json({success : true, message : `Visualisations fetched successfully`, data : visualisations});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a visualisation
export const deleteVisualisation = async (req, res) => {
    const { id } = req.params;

    try {
        const visualisation = await Visualisation.findByIdAndDelete(id);

        if (!visualisation) {
            return res.status(404).json({ success : false , message: "Visualisation not found" });
        }
        console.log("Visualisation deleted successfully");
        return res.status(200).json({ success : true , message: "Visualisation deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success : false ,message: error.message });
    }
};

export const updateVisualisation = async (req, res) => {
    
    const { id } = req.params;

    const { file,title, type, component_1, component_2, columns, category,kpi_id=null,width=0, height=0 } = req.body;

    if (!file || !title || !type || !component_1 || !component_2 || !columns || !category) {
        return res.status(400).json({ success : false , message: "Please give values for all the fields" });
    }

    try {
        const visualisation = await Visualisation.findById(id);

        if (!visualisation) {
            return res.status(404).json({ success : false , message: "Visualisation not found" });
        }

        visualisation.file = file;
        visualisation.title = title;
        visualisation.type = type;
        visualisation.component_1 = component_1;
        visualisation.component_2 = component_2;
        visualisation.width = width;
        visualisation.height = height;
        visualisation.columns = columns;
        visualisation.category = category;
        visualisation.kpi_id = kpi_id;


        await visualisation.save();
        console.log("Visualisation updated successfully");
        return res.status(200).json({ success : true , message: "Visualisation updated successfully",id: visualisation._id});
    } catch (error) {
        return res.status(500).json({ success : false , message: error.message });
    }
};
