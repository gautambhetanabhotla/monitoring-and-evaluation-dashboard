import mongoose from "mongoose";

const visualisationSchema = new mongoose.Schema({
    project_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : [true, 'Project ID is required'],
        index : true
    },
    file : {
        type : Object,
        required : [true, 'File is required']
    },
    title : {
        type : String,
        trim : true,
        required : [true, 'Title is required']
    },
    type : {
        type : String,
        enum : ['bar', 'line', 'pie', 'scatter'],
        required : [true, 'Type is required']
    },
    component_1 : {
        type : String,
        trim : true,
        required : [true, 'X Component is required']
    },
    component_2 : {
        type : String,
        trim : true,
        required : [true, 'Y Component is required']
    },  
    columns : {
        type : Array,
        required : [true, 'Columns are required']
    },
    width : {
        type : Number,
        required : [true, 'Width is required']
    },
    height : { 
        type : Number,
        required : [true, 'Height is required']
    }
});

const Visualisation = mongoose.model('Visualisation', visualisationSchema);

export default Visualisation;