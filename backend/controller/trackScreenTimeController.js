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

// GET /api/track-screen-time?role=student|teacher|guardian|admin|all&range=day|week|month|year|customYear|customRange&year=YYYY&start=YYYY-MM-DD&end=YYYY-MM-DD
export async function getScreenTime(req, res) {
  try {
    const { role, range, year, start, end } = req.query;
    let filter = {};
    if (role && role !== 'all') {
      filter.userRole = new RegExp(`^${role}$`, 'i');
    }
    const screenTimes = await ScreenTime.find(filter);

    // Helper to get date range
    function getDateRange(range, year, start, end) {
      const today = new Date();
      let from, to;
      if (range === 'day') {
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        to = new Date(from); to.setDate(from.getDate() + 1);
      } else if (range === 'week') {
        const day = today.getDay();
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day);
        to = new Date(from); to.setDate(from.getDate() + 7);
      } else if (range === 'month') {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      } else if (range === 'year') {
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear() + 1, 0, 1);
      } else if (range === 'customYear' && year) {
        const y = parseInt(year);
        if (!isNaN(y)) {
          from = new Date(y, 0, 1);
          to = new Date(y + 1, 0, 1);
        }
      } else if (range === 'customRange' && start && end) {
        from = new Date(start);
        to = new Date(end);
        to.setDate(to.getDate() + 1);
      }
      return { from, to };
    }

    const { from, to } = getDateRange(range, year, start, end);
    function isInRange(dateStr) {
      if (!from || !to) return true;
      const d = new Date(dateStr);
      return d >= from && d < to;
    }

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
      // Sum only filtered days' screenTime for this user
      const filteredDays = Array.isArray(st.days)
        ? st.days.filter(d => !d.date || isInRange(d.date))
        : [];
      const totalScreenTime = filteredDays.reduce((sum, d) => sum + (d.screenTime || 0), 0);
      userMap[st.userId].totalTime += totalScreenTime;
      // Add each filtered day as a session
      userMap[st.userId].sessions.push(...filteredDays.map(d => ({
        date: d.date,
        screenTime: d.screenTime,
        lastActive: d.lastActive
      })));
    }
    // Prepare data for graph (e.g., total time per role)
    const roleTotals = {};
    Object.values(userMap).forEach(u => {
      if (!roleTotals[u.role]) roleTotals[u.role] = 0;
      roleTotals[u.role] += u.totalTime;
    });
    // Add lastActive to each user (most recent from sessions)
    const usersWithLastActive = Object.values(userMap).map(u => {
      let lastActive = null;
      if (u.sessions && u.sessions.length > 0) {
        lastActive = u.sessions.reduce((latest, s) => {
          if (s.lastActive && (!latest || new Date(s.lastActive) > new Date(latest))) {
            return s.lastActive;
          }
          return latest;
        }, null);
      }
      return { ...u, lastActive };
    });
    res.json({
      users: usersWithLastActive,
      roleTotals,
      combinedTotal: Object.values(userMap).reduce((sum, u) => sum + u.totalTime, 0),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch screen time data.' });
  }
} 