const jwt = require('jsonwebtoken');
const { canManageUsers } = require('../utils/userPermissions');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            error: 'Authentication Required',
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Authentication Failed',
            message: 'Invalid token'
        });
    }
};

const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication Required',
                message: 'User not authenticated'
            });
        }

        const hasRole = allowedRoles.includes(req.user.role);
        const hasUserManagerAccess = allowedRoles.includes('admin') && canManageUsers(req.user);

        if (!hasRole && !hasUserManagerAccess) {
            return res.status(403).json({
                error: 'Access Denied',
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};