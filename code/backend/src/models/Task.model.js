import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    project_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : [true, 'Project ID is required'],
    },
    description : {
        type : String,
        trim : true 
    },
    title : {
        type : String,
        required : [true, 'Title is required'],
        trim : true
    }
});

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

export default Task;