import mongoose from 'mongoose';
import User from '../models/User.model.js'; 
import Project from '../models/Project.model.js';

export const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(404).json({ success: false, message: 'Invalid project ID' });
    }

    try {
        const proj = await Project.findById(projectId);
        res.status(200).json({success: true, project: proj});
    } catch (error) {
        console.error('Error fetching project:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getProjectsByClientId = async (req, res) => {
    let userId = req.query.userId;
    if (!userId) {
        userId = req.session.userId;
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).populate('assigned_projects');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // if(user.role === 'field staff') {
        //     return res.status(400).json({ success: false, message: 'User is not authorized to view this page' });
        // }

        if (!user.assigned_projects || user.assigned_projects.length === 0) {
            return res.status(200).json({ success: true, message: 'No projects assigned to this user', projects: [] });
        }

        return res.status(200).json({ success: true, projects: user.assigned_projects });
    } catch (error) {
        console.error('Error fetching user projects:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const addProjectToClient = async (req, res) => {
    const { clientId } = req.params;
    const {name, start_date, end_date, project_progress, description, states} = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(clientId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'client') {
            return res.status(400).json({ success: false, message: 'User cannot have projects' });
        }

        if(!name || !start_date || !end_date || !description || !states || !states.length) {
            return res.status(400).json({ success: false, message: 'Please enter all fields including at least one state' });
        }

        const project = new Project({
            name,
            start_date,
            end_date,
            project_progress,
            description,
            states
        });

        const newProject = await project.save();

        user.assigned_projects.push(newProject._id);
        await user.save();

        return res.status(201).json({ success: true, message: `Project created successfully under ${user.username}`, id: newProject._id });
    } catch (error) {
        console.error('Error assigning project to user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error });
    }
}

export const deleteProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ success: false, message: 'Invalid project ID' });
        }

        const deletedProject = await Project.findByIdAndDelete(projectId);

        if (!deletedProject) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        return res.status(200).json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
