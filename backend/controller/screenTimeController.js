import ScreenTime from '../models/ScreenTime.js';
import dayjs from 'dayjs';

// Helper to get YYYY-MM-DD string
function getToday() {
  return dayjs().format('YYYY-MM-DD');
}

// Get current (today's) screen time for the logged-in user
export const getScreenTime = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let record = await ScreenTime.findOne({ userId });
    const today = getToday();
    let todayTime = 0;
    let lastActive = null;
    if (record) {
      const dayRec = record.days.find(d => d.date === today);
      if (dayRec) {
        todayTime = dayRec.screenTime;
        lastActive = dayRec.lastActive;
      }
    }
    res.status(200).json({ screenTime: todayTime, lastActive });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch screen time', error: err.message });
  }
};

// Increment today's screen time for the logged-in user
export const incrementScreenTime = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    const increment = req.body.increment || 5; // seconds
    const today = getToday();
    let record = await ScreenTime.findOne({ userId });
    const now = new Date();
    if (!record) {
      record = await ScreenTime.create({ userId, userRole, days: [{ date: today, screenTime: increment, lastActive: now }] });
    } else {
      let dayRec = record.days.find(d => d.date === today);
      if (!dayRec) {
        record.days.push({ date: today, screenTime: increment, lastActive: now });
      } else {
        dayRec.screenTime += increment;
        dayRec.lastActive = now;
      }
      await record.save();
    }
    // Return today's screen time and lastActive
    const todayRec = record.days.find(d => d.date === today);
    res.status(200).json({ screenTime: todayRec?.screenTime || increment, lastActive: todayRec?.lastActive || now });
  } catch (err) {
    res.status(500).json({ message: 'Failed to increment screen time', error: err.message });
  }
};

// Get screen time history for a date range
export const getScreenTimeHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { start, end } = req.query; // YYYY-MM-DD
    let record = await ScreenTime.findOne({ userId });
    if (!record) return res.status(200).json({ history: [] });
    let filtered = record.days;
    if (start) filtered = filtered.filter(d => d.date >= start);
    if (end) filtered = filtered.filter(d => d.date <= end);
    // Ensure lastActive is included for each day
    const history = filtered.map(d => ({
      date: d.date,
      screenTime: d.screenTime,
      lastActive: d.lastActive || null
    }));
    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch screen time history', error: err.message });
  }
}; 