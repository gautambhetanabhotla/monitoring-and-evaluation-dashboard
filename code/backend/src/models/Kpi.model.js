import mongoose from "mongoose";

const kpiSchema = new mongoose.Schema({
    project_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : [true, 'Project ID is required'],
        index : true
    },
    indicator : {
        type : String,
        required : [true, 'Indicator is required'],
        trim : true
    },
    what_it_tracks : {
        type : String,
        required : [true, 'What it tracks is required'],
        trim : true
    },
    logframe_level : {
        type : String,
        required : [true, 'Logframe level is required'],
        trim : true
    },
    explanation : {
        type : String,
        trim : true
    },
    baseline : {
        type : Number,
        required : [true, 'Baseline is required'],
    },
    target : {
        type : Number,
        required : [true, 'Target is required'],
    },
});

const Kpi = mongoose.models.Kpi || mongoose.model('Kpi', kpiSchema);

export default Kpi;