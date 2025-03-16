import Task from "../models/Task.model.js";

export const createTask = async (req, res) => {
    const { project_id, description, title } = req.body;
    if (!project_id || !description || !title) {
        return res.status(400).json({ success: false, message: "Please give values for all the fields" });
    }
    const task = new Task({ project_id, description, title }); 
    try {
        const newTask = await task.save();
        return res.status(201).json({message : "Task saved successfully",newTask});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getTasksByProject = async (req, res) => {
    const { project_id } = req.params;
    try {
        if(!mongoose.Types.ObjectId.isValid(project_id)){
            return res.status(400).json({ success : false , message: "Invalid project ID" });
        }
        const tasks = await Task.find({ project_id });

        if(tasks.length === 0){
            return res.status(400).json({ success : false , message: "No tasks found for this project" });
        }

        return res.status(200).json({success : true, message : `Tasks fetched successfully`, data : tasks});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    const { project_id } = req.params;
    try {
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ success : false , message: "Task not found" });
        }
        return res.status(200).json({ success : true , message: "Task deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success : false ,message: error.message });
    }
};

export const updateTask = async (req, res) => {
    const {id} = req.params;
    const { description, title } = req.body;
    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ success : false , message: "Task not found" });
        }
        task.description = description;
        task.title = title;
        await task.save();
        return res.status(200).json({ success : true , message: "Task updated successfully" });
    } catch (error) {
        return res.status(500).json({ success : false ,message: error.message });
    }
};