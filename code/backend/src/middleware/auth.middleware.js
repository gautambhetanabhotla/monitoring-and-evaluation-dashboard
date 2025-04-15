// backend/middleware/auth.middleware.js
import User from '../models/User.model.js';

export const requireAuth = (req, res, next) => {
  if(req.session){
    console.log("Session present in requireAuth");
    if(req.session.userId){
      console.log("Session userId present in requireAuth");
    }
  }    
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
};

export const requireRole = (roles) => {
  return async (req, res, next) => {
    if(req.session){
      console.log("Session present in requireRole");
      if(req.session.userId){
        console.log("Session userId present in requireRole");
      }
    }    
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      if (!roles.includes(user.role)) {
        // Optionally destroy the session if the role is no longer valid
        req.session.destroy();
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  };
};
