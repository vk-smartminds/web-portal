import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';

export const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    // Debug log for troubleshooting
    console.log('DeleteAccount:', { id: user._id, role: user.role, userRole: user.userRole, email: user.email });
    let Model;
    let query = { _id: user._id };
    // Determine model by role/userRole
    if (user.role === 'admin' || user.isSuperAdmin !== undefined) {
      Model = Admin;
    } else if (user.role === 'student') {
      Model = Student;
    } else if (user.role === 'teacher') {
      Model = Teacher;
    } else if ((user.role === 'guardian' || user.role === 'parent') || (user.userRole && user.userRole.toLowerCase() === 'guardian')) {
      Model = Guardian;
    } else {
      console.error('Unknown user role for deletion:', { role: user.role, userRole: user.userRole, id: user._id });
      return res.status(400).json({ message: 'Unknown user role', debug: { role: user.role, userRole: user.userRole, id: user._id } });
    }
    try {
      const deleted = await Model.findOneAndDelete(query);
      if (!deleted) {
        console.error('User not found for deletion:', { model: Model.modelName, query });
        return res.status(404).json({ message: 'User not found', debug: { model: Model.modelName, query } });
      }
      res.json({ message: 'Account deleted successfully' });
    } catch (err) {
      console.error('Error deleting account:', { model: Model.modelName, query, error: err });
      res.status(500).json({ message: 'Error deleting account', error: err.message, debug: { model: Model.modelName, query } });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error deleting account', error: err.message });
  }
}; 