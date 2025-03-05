const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }
    req.user = req.session.user; // Attach session user to `req.user`
    next();
};

export default authMiddleware;
