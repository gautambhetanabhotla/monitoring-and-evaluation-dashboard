import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    project_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : [true, 'Project ID is required'],
    },
    description : {
        type : String,
        required : [true, 'Description is required'],
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