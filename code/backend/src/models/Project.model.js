import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name : {
        type : String,
        unique : true,
        required : [true, 'Name is required'],
        trim : true
    },
    start_date : {
        type: String,
        match: /^\d{4}-\d{2}-\d{2}$/,
        required: [true, 'Start date is required']
    },
    end_date : {
        type: String,
        match: /^\d{4}-\d{2}-\d{2}$/, // Ensures YYYY-MM-DD format
        required: [true, 'End date is required']
    },
    project_progress : {
        type : Number,
        default : 0
    },
    description : {
        type : String,
        trim : true
    }
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;