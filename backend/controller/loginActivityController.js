import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';
import Session from '../models/Session.js';

function getModelByRole(role) {
  if (role === 'student') return Student;
  if (role === 'teacher') return Teacher;
  if (role === 'guardian') return Guardian;
  if (role === 'admin') return Admin;
  return null;
}

export const addLoginEvent = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;
    const sessionId = req.user.sessionId || (req.body && req.body.sessionId);
    const userRole = (role.charAt(0).toUpperCase() + role.slice(1));
    // Create a new Session document
    await Session.create({
      userId,
      userRole,
      sessionId,
      login: {
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.headers['user-agent'] || ''
      },
      logout: {}
    });
    res.status(200).json({ message: 'Login event logged' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to log login event', error: err.message });
  }
};

export const addLogoutEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.user.sessionId || (req.body && req.body.sessionId);
    // Find the session by userId and sessionId
    let session = null;
    if (sessionId) {
      session = await Session.findOne({ userId, sessionId });
    }
    // Fallback: update last session for user without logout
    if (!session) {
      session = await Session.findOne({ userId, 'logout.timestamp': { $exists: false } }).sort({ 'login.timestamp': -1 });
    }
    if (session) {
      session.logout = {
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.headers['user-agent'] || ''
      };
      await session.save();
      res.status(200).json({ message: 'Logout event logged' });
    } else {
      res.status(404).json({ message: 'Session not found for logout' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to log logout event', error: err.message });
  }
};

export const getLoginActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all sessions for this user
    const sessions = await Session.find({ userId }).sort({ 'login.timestamp': -1 });
    res.status(200).json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch login activity', error: err.message });
  }
}; 