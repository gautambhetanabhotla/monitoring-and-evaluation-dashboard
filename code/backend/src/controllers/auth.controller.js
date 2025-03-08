    import bcrypt from 'bcryptjs';
    import User from '../models/User.js';
    
    export const login = async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please enter all fields" });
        }

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ success: false, message: "User does not exist" });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
            
            if (!isPasswordCorrect) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }

            req.session.user = { id: user._id, role: user.role, email: user.email };

            return res.status(200).json({ success: true, message: "User logged in successfully", role : user.role });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    export const logout = (req, res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: "Logout failed" });
                }
                res.clearCookie("connect.sid"); // Remove session cookie
                return res.status(200).json({ success: true, message: "User logged out successfully" });
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };
