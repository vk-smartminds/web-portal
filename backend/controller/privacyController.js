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

export const getProfileVisibility = async (req, res) => {
  try {
    const user = await getUserByJwt(req);
    if (!user) return res.status(400).json({ message: 'User not found' });
    res.json({ profileVisibility: user.profileVisibility || {} });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch privacy settings', error: err.message });
  }
};

export const updateProfileVisibility = async (req, res) => {
  try {
    const user = await getUserByJwt(req);
    if (!user) return res.status(400).json({ message: 'User not found' });
    // Initialize profileVisibility if missing (for old users)
    if (!user.profileVisibility) {
      // Default fields for each user type
      let defaults = {};
      if (user.role === 'student') {
        defaults = { name: true, email: true, phone: true, school: true, class: true, photo: true, guardian: true, role: true };
      } else if (user.role === 'teacher') {
        defaults = { name: true, email: true, phone: true, school: true, photo: true, role: true };
      } else if (user.userRole === 'Guardian') {
        defaults = { name: true, email: true, phone: true, child: true, photo: true, role: true };
      } else if (user.isSuperAdmin !== undefined || user.isAdmin !== undefined || user.role === 'admin') {
        defaults = { name: true, email: true, phone: true, photo: true, role: true };
      }
      user.profileVisibility = defaults;
    }
    const allowedFields = Object.keys(user.profileVisibility || {});
    const updates = req.body;
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        user.profileVisibility[key] = !!updates[key];
      }
    }
    await user.save();
    res.json({ message: 'Privacy settings updated', profileVisibility: user.profileVisibility });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update privacy settings', error: err.message });
  }
}; 