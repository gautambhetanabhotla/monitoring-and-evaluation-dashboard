import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.userId = user._id;

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.username,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message});
  }
};

export const logout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Logout failed" 
        });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ 
        success: true, 
        message: "User logged out successfully" 
      });
    });
  } else {
    return res.status(200).json({ 
      success: true, 
      message: "Already logged out" 
    });
  }
};

export const getCurrentUser = async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ 
          success: false, 
          message: "No active session found" 
        });
      }

      const user = await User.findById(req.session.userId).select("-passwordHash");
      if (!user) {
        req.session.destroy();
        return res.status(404).json({ success: false, message: "User Not Found"});
      }
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          role: user.role,
          email: user.email,
          name: user.username,
        },
      });
    }
    catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
};
