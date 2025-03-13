import mongoose, { Mongoose } from 'mongoose';
import Visualisation from '../models/Visualisation.js';

// Create a new visualisation
export const createVisualisation = async (req, res) => {
    const {project_id,title,file, type, component_1,component_2,columns,width=0,height=0 } = req.body;

    if (!project_id || !file || !title || !type || !component_1 || !component_2 || !columns) {
        return res.status(400).json({ success:false, message: "Please give values for all the fields" });
    }

    console.log(req.body);

    const visualisation = new Visualisation({
        project_id,
        file,
        title,
        type,
        component_1,
        component_2,
        columns,
        width,
        height
    });

    try {
        const newVisualisation = await visualisation.save();
        console.log("Visualisation saved successfully");
        return res.status(201).json({message : "Visualisation saved successfully",newVisualisation});
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

    const { file,title, type, component_1, component_2, columns,width=0, height=0 } = req.body;

    if (!file || !title || !type || !component_1 || !component_2 || !columns) {
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


        await visualisation.save();
        console.log("Visualisation updated successfully");
        return res.status(200).json({ success : true , message: "Visualisation updated successfully" });
    } catch (error) {
        return res.status(500).json({ success : false , message: error.message });
    }
};
