import mongoose from 'mongoose';

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

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;