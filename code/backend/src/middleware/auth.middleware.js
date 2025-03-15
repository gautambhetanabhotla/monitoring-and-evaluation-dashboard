// backend/middleware/auth.middleware.js
import User from '../models/User.js';

export const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
};

export const requireRole = (roles) => {
  return async (req, res, next) => {
    if (req.session && req.session.user) {
      // Re-fetch the user to ensure the role is up-to-date
      const user = await User.findById(req.session.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      if (!roles.includes(user.role)) {
        // Optionally destroy the session if the role is no longer valid
        req.session.destroy();
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      // Update the session if the role has changed
      req.session.user.role = user.role;
      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  };
};
