import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Guardian from '../models/Guardian.js';
import Teacher from '../models/Teacher.js';

// Find a user by email (superadmin only)
export const findUserByEmail = async (req, res) => {
  try {
    const { email, requesterEmail } = req.body;
    // Check if requester is superadmin
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    // Search in all user collections
    let user = await Student.findOne({ email: email.trim().toLowerCase() }).select('-password -__v');
    if (!user) user = await Guardian.findOne({ email: email.trim().toLowerCase() }).select('-password -__v');
    if (!user) user = await Teacher.findOne({ email: email.trim().toLowerCase() }).select('-password -__v');
    if (!user) user = await Admin.findOne({ email: email.trim().toLowerCase() }).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error finding user', error: err.message });
  }
};

// Delete a user by email (superadmin only)
export const deleteUserByEmail = async (req, res) => {
  try {
    const { email, requesterEmail } = req.body;
    // Check if requester is superadmin
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    // Try deleting from all user collections
    let user = await Student.findOne({ email: email.trim().toLowerCase() });
    if (user) { await Student.deleteOne({ email: email.trim().toLowerCase() }); return res.json({ message: 'Student deleted successfully' }); }
    user = await Guardian.findOne({ email: email.trim().toLowerCase() });
    if (user) { await Guardian.deleteOne({ email: email.trim().toLowerCase() }); return res.json({ message: 'Guardian deleted successfully' }); }
    user = await Teacher.findOne({ email: email.trim().toLowerCase() });
    if (user) { await Teacher.deleteOne({ email: email.trim().toLowerCase() }); return res.json({ message: 'Teacher deleted successfully' }); }
    user = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (user) { await Admin.deleteOne({ email: email.trim().toLowerCase() }); return res.json({ message: 'Admin deleted successfully' }); }
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
};