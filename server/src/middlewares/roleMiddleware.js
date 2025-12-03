function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${requiredRole}s can perform this action.`,
      });
    }
    next();
  };
}

module.exports = roleMiddleware;
