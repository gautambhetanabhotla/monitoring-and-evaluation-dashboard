import mongoose from "mongoose";

const KpiUpdateSchema = new mongoose.Schema({
    task_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Task',
        required : [true, 'Task is required'],
    },
    kpi_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'KPI',
        required : [true, 'KPI is required'],
    },
    initial : {
        type : Number,
        required : [true, 'Initial value is required'],
    },
    final : {
        type : Number,
        required : [true, 'Final value is required'],
    },
    updated_at : {
        type : Date,
        required : [true, 'Date is required'],
    },
    note : {
        type : String,
        trim : true,
    },
    updated_by : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : [true, 'Updated by is required'],
    }
});

const KpiUpdate = mongoose.models.KpiUpdate || mongoose.model('KpiUpdate', KpiUpdateSchema);

export default KpiUpdate;