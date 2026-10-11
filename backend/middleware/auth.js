import { verifyToken } from '../auth.js';

export function requireAuth(allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR']) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions.' });
    }

    req.user = decoded;
    next();
  };
}
