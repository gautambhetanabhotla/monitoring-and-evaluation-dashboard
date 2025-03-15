import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getClients = async (req, res) => {
    try {
        const clients = await User.find({ role: "client" }).select("-passwordHash");
        return res.status(200).json({success : true,message : "Clients fetched successfully",clients:clients});
    } catch (error) {
        return res.status(500).json({success :false, message: error.message });
    }
}

export const addUser = async (req, res) => {
    const { username, email, password, role, phone_number } = req.body;

    if (!username || !email || !password || !role || !phone_number) {
        return res.status(400).json({success : false, message: "Please enter all fields" });
    }

    const user = new User({
        username,
        email,
        passwordHash: bcrypt.hashSync(password, 10),
        role,
        phone_number,
    });

    const existingUser = await User.findOne({
        $or: [{ email: user.email }, { phone_number: user.phone_number }, { username: user.username }],
    });

    if (existingUser) {
        return res.status(400).json({success :false, message: "User already exists" });
    }

    try {
        const newUser = await user.save();
        return res.status(201).json({success : true,message : "User added successfully" ,user:newUser});
    } catch (error) {
        return res.status(500).json({success:false, message: error.message });
    }
}

export const getUser = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    console.log("Session user", req.session.user);
    return res.status(200).json({ success: true, user: req.session.user });
};


export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({success : true, message: "User not found" });
        }

        return res.status(200).json({success : true, message: "User deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({success: false, message: error.message });
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, role, phone_number } = req.body;

    isUserRoleUpdated = false;

    if (!username || !email || !role || !phone_number) {
        return res.status(400).json({success:false, message: "Please enter all fields" });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({success:false, message: "User not found" });
        }

        if(user.role!==role){
            isUserRoleUpdated = true;
        }

        user.username = username;
        user.email = email;
        user.role = role;
        user.phone_number = phone_number;

        const updatedUser = await user.save();
        if(isUserRoleUpdated){
            res.session.user.role = role;
            console.log("Session user", req.session.user);
        }
        return res.status(200).json({success : true,user : updatedUser});

    } catch (error) {
        return res.status(500).json({success : false, message: error.message });
    }
}

