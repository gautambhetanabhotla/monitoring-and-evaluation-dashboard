import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
    // user_id: { type: Number, unique: true, required: true },
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required'],
        minlength: 3,
        maxlength: 50,
    },
    passwordHash: { type: String, required: [true, 'Password is required'] },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['admin', 'client', 'field staff'],
    },
    // state_union_territory: { type: String, required: [true, 'State/Union Territory is required'], enum: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'] },
    // temporary_credentials: { type: String },
    // last_login: { type: Date },
    // activity_log: { type: mongoose.Schema.Types.Mixed },
    preferences: { type: mongoose.Schema.Types.Mixed },
    phone_number: {
        type: String,
        unique: true,
        required: [true, 'Phone number is required'],
        match: [/^\d{10}$/, 'Invalid phone number format'],
    },
    // status: { type: String, required: [true, 'Status is required'], enum: ['active', 'inactive'] },
    // address: { type: String },
    // data_entry_period: { type: Date, required: function() { return this.role === 'field staff'; } },
    assigned_projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: function () {
                return this.role === 'field staff';
            },
        },
    ],
});

// Indexes
// userSchema.index({ user_id: 1 });
// userSchema.index({ username: 1 });
// userSchema.index({ email: 1 });
// userSchema.index({ phone_number: 1 });
// userSchema.index({ role: 1 });

userSchema.pre('save', function (next) {
    this.email = this.email.toLowerCase();
    next();
});

userSchema.post('save', function (doc) {
    // Log changes to the user's role
    if (this.isModified('role')) {
        console.log(`User role changed: ${doc}`);
    }
});

userSchema.post('remove', function (doc) {
    // Log the deletion of a user account
    console.log(`User deleted: ${doc}`);
});

const userModel = mongoose.model('User', userSchema);

// Project Schema
const projectSchema = new mongoose.Schema(
    {
        // project_id: { type: Number, unique: true, required: true },
        title: {
            type: String,
            required: [true, 'Title is required'],
            minlength: 5,
            maxlength: 100,
        },
        description: { type: String },
        thrust_areas: [
            { type: String, required: [true, 'Thrust areas are required'] },
        ],
        state_union_territory: {
            type: [String],
            required: [true, 'State/Union Territory is required'],
            enum: [
                'Andhra Pradesh',
                'Arunachal Pradesh',
                'Assam',
                'Bihar',
                'Chhattisgarh',
                'Goa',
                'Gujarat',
                'Haryana',
                'Himachal Pradesh',
                'Jharkhand',
                'Karnataka',
                'Kerala',
                'Madhya Pradesh',
                'Maharashtra',
                'Manipur',
                'Meghalaya',
                'Mizoram',
                'Nagaland',
                'Odisha',
                'Punjab',
                'Rajasthan',
                'Sikkim',
                'Tamil Nadu',
                'Telangana',
                'Tripura',
                'Uttar Pradesh',
                'Uttarakhand',
                'West Bengal',
                'Andaman and Nicobar Islands',
                'Chandigarh',
                'Dadra and Nagar Haveli and Daman and Diu',
                'Lakshadweep',
                'Delhi',
                'Puducherry',
                'Ladakh',
                'Jammu and Kashmir',
            ],
        },
        location: { type: String, required: [true, 'Location is required'] }, // TO DO: Review data type of location, maybe gmaps link?
        milestones: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
        ],
        budget: {
            type: Number,
            required: [true, 'Budget is required'],
            min: 0,
        },
        budget_usage: {
            type: Number,
            required: [true, 'Budget usage is required'],
            min: 0,
        },
        targets: [{ type: String }], // COME BACK TO THIS
        tags: [{ type: String }],
        proxy_indicators: [{ type: String }],
        client_id: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: function () {
                    return this.role === 'client';
                },
            },
        ],
        // status_comparison: { type: mongoose.Schema.Types.Mixed },
        completion_status: {
            type: String,
            default: 'Not Started',
            enum: [
                'Not Started',
                'In Progress',
                'On Hold',
                'Successfully Completed',
                'Delayed',
                'Cancelled',
                'Under review',
                'Failed',
                'Extended',
            ],
        },
        // average_budget: { type: Number, min: 0 },
        risk_assessment: { type: String },
        // dependencies: [
            // { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        // ],
        timeline: {
            start_date: {
                type: Date,
                required: [true, 'Start date is required'],
            },
            end_date_expected: {
                type: Date,
                required: [true, 'Expected end date is required'],
            },
            end_date_actual: { type: Date },
        },
        // duration: { type: Number },
        // stakeholder_feedback: { type: mongoose.Schema.Types.Mixed },
        // progress_estimation: { type: mongoose.Schema.Types.Mixed },
        kpi: [{ type: mongoose.Schema.Types.Mixed }],// COME BACK TO THIS
        // data_visualization: { type: mongoose.Schema.Types.Mixed },
        // blog: { type: String },
        success_stories: [{ type: mongoose.Schema.Types.Mixed }],// COME BACK TO THIS
        // print_options: { type: mongoose.Schema.Types.Mixed },
        // summary: { type: String, maxlength: 30 },
        // reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
        // timeline_graph_comparison_with_progress: {
            // type: mongoose.Schema.Types.Mixed,
        // },
        documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
        status_updates: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'StatusUpdate' },
        ],
        // images: [{ type: String }],
        // field_observations: { type: String },
    },
    {
        timestamps: true,
    }
);

// Indexes
// projectSchema.index({ project_id: 1 });
// projectSchema.index({ title: 1 });
// projectSchema.index({ state_union_territory: 1 });
// projectSchema.index({ client_id: 1 });
// projectSchema.index({ assigned_field_agents: 1 });

// projectSchema.pre('save', function (next) {
    // if (!this.completion_status) {
        // this.completion_status = 'Not Started';
//     }
//     next();
// });

// projectSchema.post('save', function (doc) {
//     // Log changes to the project's budget
//     if (this.isModified('budget')) {
//         console.log(`Project budget changed: ${doc}`);
//     }
// });

const projectModel = mongoose.model('Project', projectSchema);

// Milestone Schema
const taskSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        progress : {
            type : String ,
            required : true,
            enum: [
                'Not Started',
                'In Progress',
                'On Hold',
                'Successfully Completed',
                'Delayed',
                'Cancelled',
                'Under review',
                'Failed',
                'Extended',
            ]
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
        },
        description: { type: String },
        deadline: { type: Date, required: [true, 'Deadline is required'] },
        completion_percentage: {
            type: Number,
            required: [true, 'Completion percentage is required'],
            min: 0,
            max: 100,
        },
        updates: [
            {
                kpi_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Kpi',required: true },
                updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                updated_at: { type: Date, default: Date.now },
                value_before: { type: mongoose.Schema.Types.Mixed, required: true },
                value_after: { type: mongoose.Schema.Types.Mixed, required: true },
            },
        ],
        // stakeholder_feedback: { type: mongoose.Schema.Types.Mixed },
        // baseline_data: { type: mongoose.Schema.Types.Mixed },

    },
    {
        timestamps: true,
    }
);

const KpiSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        indicators : {
            type : [String] ,
            required : true,
        },
        What_it_tracks : {
            type : [String] ,
            required : true,
        },
        Baseline : {
            type : Number,
            required : true,
        },
        Target : {
            type : Number,
            required : true,
        },
        Current_Status : {
            type : Number,
            required : true,
        },
        Explanation :  { 
            type : String, // I want it to be in md format
            required : true,
        },
        } ,       
        // stakeholder_feedback: { type: mongoose.Schema.Types.Mixed },
        // baseline_data: { type: mongoose.Schema.Types.Mixed },
    {
        timestamps: true,
    }
);
// Indexes
taskSchema.index({ project_id: 1 });

// Triggers
taskSchema.pre('save', function (next) {
    if (this.isNew && this.deadline <= new Date()) {
        return next(new Error('Deadline must be in the future'));
    }
    next();
});

taskSchema.post('save', function (doc) {
    if (this.isModified('deadline')) {
        console.log(`Task deadline changed: ${doc}`);
    }
});

taskSchema.post('remove', function (doc) {
    console.log(`Task removed: ${doc}`);
});

const taskModel = mongoose.model('Task', taskSchema);
const kpiModel = mongoose.model('Kpi', KpiSchema);

export { userModel, projectModel, taskModel, kpiModel };