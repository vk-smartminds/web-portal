import ScreenTime from '../models/ScreenTime.js';

// Get current screen time for the logged-in user
export const getScreenTime = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    let record = await ScreenTime.findOne({ userId });
    if (!record) {
      // Create if not exists
      record = await ScreenTime.create({ userId, userRole, screenTime: 0 });
    }
    res.status(200).json({ screenTime: record.screenTime });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch screen time', error: err.message });
  }
};

// Increment screen time for the logged-in user
export const incrementScreenTime = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    const increment = req.body.increment || 5; // seconds
    let record = await ScreenTime.findOne({ userId });
    if (!record) {
      record = await ScreenTime.create({ userId, userRole, screenTime: increment });
    } else {
      record.screenTime += increment;
      record.lastActive = new Date();
      await record.save();
    }
    res.status(200).json({ screenTime: record.screenTime });
  } catch (err) {
    res.status(500).json({ message: 'Failed to increment screen time', error: err.message });
  }
}; 