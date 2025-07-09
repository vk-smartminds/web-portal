import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Guardian from '../models/Guardian.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    if (decoded.role === 'student') {
      user = await Student.findById(decoded.userId);
    } else if (decoded.role === 'guardian') {
      user = await Guardian.findById(decoded.userId);
    } else if (decoded.role   === 'teacher') {
      user = await Teacher.findById(decoded.userId);
    } else if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.userId);
      if (user) user.isAdmin = true;
    }
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    req.user.role = decoded.role; // Attach role from token
    if (decoded.sessionId) req.user.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export const generateToken = (userId, role, sessionId) => {
  const payload = { userId, role };
  if (sessionId) payload.sessionId = sessionId;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};