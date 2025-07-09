import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';

// Change password for any user type (student, teacher, guardian, admin)
export const changePassword = async (req, res) => {
  try {
    console.log('DEBUG: changePassword called');
    console.log('DEBUG: req.user:', req.user);
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;
    console.log('DEBUG: userId:', userId, 'userRole:', userRole);
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    console.log('DEBUG: Request body:', { currentPassword, newPassword, confirmNewPassword });
    // Get model by role
    let Model;
    if (userRole === 'student') Model = Student;
    else if (userRole === 'teacher') Model = Teacher;
    else if (userRole === 'guardian') Model = Guardian;
    else if (userRole === 'admin') Model = Admin;
    else {
      console.log('DEBUG: Invalid user role:', userRole);
      return res.status(400).json({ message: 'Invalid user role.' });
    }
    const user = await Model.findById(userId);
    console.log('DEBUG: user from DB:', user);
    if (!user) {
      console.log('DEBUG: User not found in DB');
      return res.status(404).json({ message: 'User not found.' });
    }
    // Step 1: Only currentPassword provided (verify only)
    if (currentPassword && !newPassword && !confirmNewPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      console.log('DEBUG: Step 1, isMatch:', isMatch);
      if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });
      return res.json({ message: 'Current password verified.' });
    }
    // Step 2: All fields provided (change password)
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      console.log('DEBUG: Missing password fields');
      return res.status(400).json({ message: 'All password fields are required.' });
    }
    if (newPassword !== confirmNewPassword) {
      console.log('DEBUG: New passwords do not match');
      return res.status(400).json({ message: 'New passwords do not match.' });
    }
    // Password strength validation
    const passwordRequirements = {
      length: newPassword.length >= 8 && newPassword.length <= 30,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword)
    };
    if (!passwordRequirements.length || !passwordRequirements.uppercase || !passwordRequirements.lowercase || !passwordRequirements.number) {
      return res.status(400).json({
        message: 'Password must be 8-30 characters and include uppercase, lowercase, and a number.'
      });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log('DEBUG: Step 2, isMatch:', isMatch);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });
    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    console.log('DEBUG: Password updated successfully');
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.log('DEBUG: Error in changePassword:', err);
    res.status(500).json({ message: 'Failed to update password', error: err.message });
  }
}; 