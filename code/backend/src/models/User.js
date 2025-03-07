import mongoose from "mongoose";

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

const User = mongoose.model('User', userSchema);

export default User;