import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: "client" }).select("-passwordHash");
    return res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      clients: clients,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addUser = async (req, res) => {
  const { username, email, password, role, phone_number } = req.body;

  if (!username || !email || !phone_number) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter all fields" });
  }

  const existingUser = await User.findOne({
    $or: [
      { email: email },
      { phone_number: phone_number },
      { username: username },
    ],
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const user = new User({
    username,
    email,
    passwordHash,
    role,
    phone_number,
  });

  try {
    const newUser = await user.save();
    return res.status(201).json({
      success: true,
      message: "User added successfully",
      id: newUser._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  if(!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  try {
    const user = await User.findById(req.session.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username,
      },
    });
  } 
  catch (error) {
    return res.status(500)
              .json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: true, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, phone_number } = req.body;

  if (!username || !email || !role || !phone_number) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter all fields" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user properties
    user.username = username;
    user.email = email;
    user.role = role;
    user.phone_number = phone_number;

    const updatedUser = await user.save();
    // Since we only store the user ID in session, there's no need to update the session here.
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { pwd } = req.body;

  if(!pwd) {
    return res.status(400).json({ success: false, message: "Please enter all fields" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid user ID" });
  }
  
  try {
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const passwordHash = bcrypt.hashSync(pwd, 10);
    user.passwordHash = passwordHash;

    const updatedUser = await user.save();
    return res.status(200).json({ success: true, user: updatedUser });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
