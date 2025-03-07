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
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone_number: 1 });
userSchema.index({ role: 1 });

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

const projectSchema = new mongoose.Schema(
    {
        // project_id: { type: Number, unique: true, required: true },
        title: {
            type: String,
            required: [true, 'Title is required'],
            minlength: 5,
            maxlength: 100,
        },
        description: { type: String, minlength: 300 },
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
        project_term: {
            type: String,
            enum: ['short-term', 'medium-term', 'long-term', 'high impact'],
        },
        client_id: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: function () {
                    return this.role === 'client';
                },
            },
        ],
        status_comparison: { type: mongoose.Schema.Types.Mixed },
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
        average_budget: { type: Number, min: 0 },
        risk_assessment: { type: String },
        dependencies: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        ],
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
        duration: { type: Number },
        stakeholder_feedback: { type: mongoose.Schema.Types.Mixed },
        progress_estimation: { type: mongoose.Schema.Types.Mixed },
        kpi: { type: mongoose.Schema.Types.Mixed },
        data_visualization: { type: mongoose.Schema.Types.Mixed },
        blog: { type: String },
        case_studies: { type: mongoose.Schema.Types.Mixed },
        progress_bar: {
            type: Boolean,
            required: [true, 'Progress bar is required'],
        },
        print_options: { type: mongoose.Schema.Types.Mixed },
        summary: { type: String, maxlength: 30 },
        reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
        timeline_graph_comparison_with_progress: {
            type: mongoose.Schema.Types.Mixed,
        },
        documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
        status_updates: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'StatusUpdate' },
        ],
        images: [{ type: String }],
        field_observations: { type: String },
        assigned_field_agents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: function () {
                    return this.role === 'field staff';
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
projectSchema.index({ project_id: 1 });
projectSchema.index({ title: 1 });
projectSchema.index({ state_union_territory: 1 });
projectSchema.index({ client_id: 1 });
projectSchema.index({ assigned_field_agents: 1 });

projectSchema.pre('save', function (next) {
    if (!this.completion_status) {
        this.completion_status = 'Not Started';
    }
    next();
});

projectSchema.post('save', function (doc) {
    // Log changes to the project's budget
    if (this.isModified('budget')) {
        console.log(`Project budget changed: ${doc}`);
    }
});

const projectModel = mongoose.model('Project', projectSchema);

// Milestone Schema
const milestoneSchema = new mongoose.Schema(
    {
        milestone_id: { type: Number, unique: true, required: true },
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            minlength: 5,
            maxlength: 100,
        },
        description: { type: String, minlength: 50 },
        deadline: { type: Date, required: [true, 'Deadline is required'] },
        completion_percentage: {
            type: Number,
            required: [true, 'Completion percentage is required'],
            min: 0,
            max: 100,
        },
        stakeholder_feedback: { type: mongoose.Schema.Types.Mixed },
        baseline_data: { type: mongoose.Schema.Types.Mixed },
    },
    {
        timestamps: true,
    }
);

// Indexes
milestoneSchema.index({ project_id: 1 });

// Triggers
milestoneSchema.pre('save', function (next) {
    if (this.isNew && this.deadline <= new Date()) {
        return next(new Error('Deadline must be in the future'));
    }
    next();
});

milestoneSchema.post('save', function (doc) {
    if (this.isModified('deadline')) {
        console.log(`Milestone deadline changed: ${doc}`);
    }
});

milestoneSchema.post('remove', function (doc) {
    console.log(`Milestone removed: ${doc}`);
});

const milestoneModel = mongoose.model('Milestone', milestoneSchema);

// Authentication Schema
const authSchema = new mongoose.Schema(
    {
        auth_id: {
            type: Number,
            unique: true,
            required: true,
            autoIncrement: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        token: {
            type: String,
            required: [true, 'Token is required'],
            minlength: 20,
        },
        expiration: {
            type: Date,
            required: [true, 'Expiration date is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
authSchema.index({ user_id: 1 });
authSchema.index({ token: 1 });

// Triggers
authSchema.pre('save', async function (next) {
    const existingAuth = await authModel.findOne({ token: this.token });
    if (existingAuth) {
        return next(new Error('Token must be unique'));
    }
    next();
});

authSchema.post('remove', function (doc) {
    console.log(`Authentication record removed: ${doc}`);
});

const authModel = mongoose.model('Auth', authSchema);

export { userModel, projectModel, milestoneModel, authModel };
