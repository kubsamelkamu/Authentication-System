const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        const { role } = req.user;
        if (!role || role !== requiredRole) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = authorizeRole;
