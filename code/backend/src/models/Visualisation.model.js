import mongoose from "mongoose";

const visualisationSchema = new mongoose.Schema({
    project_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : [true, 'Project ID is required'],
    },
    file : {
        type : Object,
        required :[
            function() {
                return this.category === 'file';
            },
            "File is required if category is file"
        ],
    },
    category : {
        type : String,
        required : [true, 'Category is required'],
        enum : ['KPI', 'file'],
    },
    kpi_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'KPI',
        required : [
            function() {
                return this.category === 'KPI';
            },
            "KPI ID is required if category is KPI"
        ],
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
   colors: {
        type: Object,
        required: [true, 'Colors are required'],
        backgroundColor: {
            type: [String],
            required: true
        },
        borderColor: {
            type: [String],
            required: true
        }
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