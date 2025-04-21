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
    },
    states : {
        type : [String],
        required : [true, 'At least one state is required'],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'At least one state must be selected'
        },
        enum: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
               'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
               'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
               'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
               'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 
               'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
               'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir']
    }
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;