import mongoose from "mongoose";
import Visualisation from '../models/Visualisation.model.js';
import KpiUpdate from '../models/KpiUpdate.model.js';

// Create a new visualisation
export const createVisualisation = async (req, res) => {
    const {
        project_id,
        title,
        file,
        type,
        component_1,
        component_2,
        columns,
        category,
        kpi_id = null,
        colors,
        width = 0,
        height = 0
    } = req.body;

    if (!project_id || !title || !type || !component_1 || !component_2 || !columns || !category) {
        return res.status(400).json({ success: false, message: "Please give values for all the fields" });
    }

    if (category === 'file' && !file) {
        return res.status(400).json({ success: false, message: "File is required when category is 'file'" });
    }
    if (category === 'KPI' && !kpi_id) {
        return res.status(400).json({ success: false, message: "KPI ID is required when category is 'KPI'" });
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
        colors,
        width,
        height
    });

    try {
        const newVisualisation = await visualisation.save();
        console.log("Visualisation saved successfully");
        return res.status(201).json({ message: "Visualisation saved successfully", id: newVisualisation._id });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get all visualisations based on project
export const getVisualisationsByProject = async (req, res) => {
    const { project_id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(project_id)) {
            return res.status(400).json({ success: false, message: "Invalid project ID" });
        }

        const visualisations = await Visualisation.find({ project_id });

        if (visualisations.length === 0) {
            return res.status(200).json({ success: false, message: "No visualisations found for this project" });
        }

        for (let i = 0; i < visualisations.length; i++) {
            if (visualisations[i].category === "KPI") {
                const kpiUpdates = await KpiUpdate.find({ kpi_id: visualisations[i].kpi_id });
                if (kpiUpdates.length === 0) {
                    // Log warning and assign an empty array if no updates are found
                    console.warn(`No KPI updates found for KPI ${visualisations[i].kpi_id}`);
                    visualisations[i].file = JSON.stringify([]);
                } else {
                    visualisations[i].file = JSON.stringify(
                        kpiUpdates.map(kpiUpdate => ({
                            DateTime: kpiUpdate.updated_at.toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            }),
                            Value: kpiUpdate.final 
                        }))
                    );
                }
            }
        }

        console.log("Visualisations fetched successfully");
        return res.status(200).json({ success: true, message: "Visualisations fetched successfully", data: visualisations });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a visualisation
export const deleteVisualisation = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid visualisation ID" });
    }

    try {
        const visualisation = await Visualisation.findByIdAndDelete(id);

        if (!visualisation) {
            return res.status(404).json({ success: false, message: "Visualisation not found" });
        }
        console.log("Visualisation deleted successfully");
        return res.status(200).json({ success: true, message: "Visualisation deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update a visualisation
export const updateVisualisation = async (req, res) => {
    const { id } = req.params;
    const {
        file,
        title,
        type,
        component_1,
        component_2,
        columns,
        category,
        kpi_id = null,
        colors,
        width = 0,
        height = 0
    } = req.body;

    // Validate required fields for all visualisations
    if (!title || !type || !component_1 || !component_2 || !columns || !category) {
        return res.status(400).json({ success: false, message: "Please give values for all the fields" });
    }

    // Conditional validation based on category
    if (category === 'file' && !file) {
        return res.status(400).json({ success: false, message: "File is required when category is 'file'" });
    }
    if (category === 'KPI' && !kpi_id) {
        return res.status(400).json({ success: false, message: "KPI ID is required when category is 'KPI'" });
    }

    try {
        const visualisation = await Visualisation.findById(id);

        if (!visualisation) {
            return res.status(404).json({ success: false, message: "Visualisation not found" });
        }

        visualisation.file = file;
        visualisation.title = title;
        visualisation.type = type;
        visualisation.component_1 = component_1;
        visualisation.component_2 = component_2;
        visualisation.columns = columns;
        visualisation.category = category;
        visualisation.kpi_id = kpi_id;
        visualisation.width = width;
        visualisation.height = height;
        visualisation.colors = colors;

        await visualisation.save();
        console.log("Visualisation updated successfully");
        return res.status(200).json({ success: true, message: "Visualisation updated successfully", id: visualisation._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
