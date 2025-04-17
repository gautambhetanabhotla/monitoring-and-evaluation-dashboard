import mongoose from "mongoose";
import SuccessStory from '../models/successStory.model.js';

export const createSuccessStory = async (req, res) => {
    const {
        projectid,
        name,
        location,
        text,
        images = [],
        date = new Date(),
    } = req.body;

    // Validate required fields
    if (!projectid || !name) {
        return res.status(400).json({ success: false, message: "Please provide values for projectid, name, and text" });
    }

    try {
        const successStory = new SuccessStory({
            projectid,
            name,
            location,
            text,
            images,
            date
        });

        const newStory = await successStory.save();
        console.log("Success story saved successfully");
        return res.status(201).json({ success: true, message: "Success story saved successfully", id: newStory._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getSuccessStoriesByProject = async (req, res) => {
    const { projectid } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(projectid)) {
            return res.status(400).json({ success: false, message: "Invalid project ID" });
        }

        const successStories = await SuccessStory.find({ projectid });

        if (successStories.length === 0) {
            return res.status(200).json({ success: false, message: "No success stories found for this project" });
        }

        console.log("Success stories fetched successfully");
        return res.status(200).json({ success: true, message: "Success stories fetched successfully", data: successStories });
    } catch (error) {
        console.error("Error fetching success stories:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSuccessStory = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid success story ID" });
    }

    try {
        const story = await SuccessStory.findByIdAndDelete(id);

        if (!story) {
            return res.status(201).json({ success: false, message: "Success story not found" });
        }
        console.log("Success story deleted successfully");
        return res.status(200).json({ success: true, message: "Success story deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update a success story
export const updateSuccessStory = async (req, res) => {
    const { id } = req.params;
    const {
        projectid,
        name,
        location,
        text,
        images,
        date,
    } = req.body;

    // Validate required fields
    if (!name) {
        return res.status(400).json({ success: false, message: "Please provide values for name and text" });
    }

    try {
        const successStory = await SuccessStory.findById(id);

        if (!successStory) {
            return res.status(201).json({ success: false, message: "Success story not found" });
        }

        successStory.projectid = projectid;
        successStory.name = name;
        successStory.location = location;
        successStory.text = text;
        successStory.images = images;
        successStory.date = date;

        await successStory.save();
        console.log("Success story updated successfully");
        return res.status(200).json({ success: true, message: "Success story updated successfully", id: successStory._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
