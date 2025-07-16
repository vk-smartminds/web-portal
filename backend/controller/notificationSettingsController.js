import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';

// Helper to get model and user by JWT
async function getUserByJwt(req) {
  const userId = req.user.id;
  const role = req.user.role;
  let user = null;
  if (role === 'student') user = await Student.findById(userId);
  else if (role === 'teacher') user = await Teacher.findById(userId);
  else if (role === 'guardian') user = await Guardian.findById(userId);
  else if (role === 'admin') user = await Admin.findById(userId);
  return user;
}

export const getNotificationSettings = async (req, res) => {
  try {
    const user = await getUserByJwt(req);
    if (!user) return res.status(400).json({ message: 'User not found' });
    // Default notification settings if not present
    if (!user.notificationSettings) {
      // Set all defaults from schema
      user.notificationSettings = {
        announcements: true,
        assignmentDeadlines: false,
        newResources: true,
        systemUpdates: false
      };
      await user.save();
    }
    // Convert Mongoose subdoc to plain object
    const notif = user.notificationSettings.toObject ? user.notificationSettings.toObject() : user.notificationSettings;
    res.json({ notificationSettings: notif });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notification settings', error: err.message });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const user = await getUserByJwt(req);
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.notificationSettings) {
      user.notificationSettings = {
        announcements: true,
        assignmentDeadlines: false,
        newResources: true,
        systemUpdates: false
      };
    }
    const updates = req.body;
    for (const key of Object.keys(updates)) {
      if (user.notificationSettings[key] !== undefined) {
        user.notificationSettings[key] = !!updates[key];
      }
    }
    await user.save();
    const notif = user.notificationSettings.toObject ? user.notificationSettings.toObject() : user.notificationSettings;
    res.json({ message: 'Notification settings updated', notificationSettings: notif });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification settings', error: err.message });
  }
}; 