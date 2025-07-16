import mongoose from 'mongoose';
import ScreenTime from '../models/ScreenTime.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';

// Helper to get user info by role
async function getUserInfo(role, id) {
  if (!id) return null;
  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
  if (role === 'student') return await Student.findById(objectId).select('name email role');
  if (role === 'teacher') return await Teacher.findById(objectId).select('name email role');
  if (role === 'admin') return await Admin.findById(objectId).select('name email role');
  if (role === 'guardian' || role === 'parent') return await Guardian.findById(objectId).select('name email userRole');
  return null;
}

// GET /api/track-screen-time?role=student|teacher|guardian|admin|all
export async function getScreenTime(req, res) {
  try {
    const { role } = req.query;
    let filter = {};
    if (role && role !== 'all') {
      filter.userRole = new RegExp(`^${role}$`, 'i');
    }
    const screenTimes = await ScreenTime.find(filter);
    // Group by user and role
    const userMap = {};
    for (const st of screenTimes) {
      let userRole = st.role || st.userRole;
      if ((userRole === 'guardian' || userRole === 'parent') && st.userRole) userRole = st.userRole;
      if (!userMap[st.userId]) {
        const userInfo = await getUserInfo(userRole?.toLowerCase(), st.userId);
        userMap[st.userId] = {
          userId: st.userId,
          role: userRole,
          name: userInfo?.name || '',
          email: userInfo?.email || '',
          totalTime: 0,
          sessions: [],
        };
      }
      // Sum all days' screenTime for this user
      const totalScreenTime = Array.isArray(st.days)
        ? st.days.reduce((sum, d) => sum + (d.screenTime || 0), 0)
        : 0;
      userMap[st.userId].totalTime += totalScreenTime;
      // Add each day as a session
      if (Array.isArray(st.days)) {
        userMap[st.userId].sessions.push(...st.days.map(d => ({
          date: d.date,
          screenTime: d.screenTime,
          lastActive: d.lastActive
        })));
      }
    }
    // Prepare data for graph (e.g., total time per role)
    const roleTotals = {};
    Object.values(userMap).forEach(u => {
      if (!roleTotals[u.role]) roleTotals[u.role] = 0;
      roleTotals[u.role] += u.totalTime;
    });
    res.json({
      users: Object.values(userMap),
      roleTotals,
      combinedTotal: Object.values(userMap).reduce((sum, u) => sum + u.totalTime, 0),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screen time data.' });
  }
} 