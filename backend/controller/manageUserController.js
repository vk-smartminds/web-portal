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

export const findStudentByEmail = async (req, res) => {
  try {
    const { email, requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    let user = await Student.findOne({ email: email.trim().toLowerCase() }).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Student not found' });
    user = user.toObject();
    user.guardian = Array.isArray(user.guardian) ? user.guardian : [];
    if (user.photo && user.photo.data) {
      user.photo = `data:${user.photo.contentType};base64,${user.photo.data.toString('base64')}`;
    } else {
      user.photo = null;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error finding student', error: err.message });
  }
};

export const findTeacherByEmail = async (req, res) => {
  try {
    const { email, requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    let user = await Teacher.findOne({ email: email.trim().toLowerCase() }).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Teacher not found' });
    user = user.toObject();
    if (user.photo && user.photo.data) {
      user.photo = `data:${user.photo.contentType};base64,${user.photo.data.toString('base64')}`;
    } else {
      user.photo = null;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error finding teacher', error: err.message });
  }
};

export const findGuardianByEmail = async (req, res) => {
  try {
    const { email, requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    let user = await Guardian.findOne({ email: email.trim().toLowerCase() }).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Guardian not found' });
    user = user.toObject();
    user.child = Array.isArray(user.child) ? user.child : [];
    if (user.photo && user.photo.data) {
      user.photo = `data:${user.photo.contentType};base64,${user.photo.data.toString('base64')}`;
    } else {
      user.photo = null;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error finding guardian', error: err.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    let students = await Student.find({}, '-password -__v -guardianIds -quizIds');
    students = students.map(s => {
      const obj = s.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      // Set photo as base64 data URL or null
      if (obj.photo && obj.photo.data) {
        obj.photo = `data:${obj.photo.contentType};base64,${obj.photo.data.toString('base64')}`;
      } else {
        obj.photo = null;
      }
      // Ensure guardian array is present
      obj.guardian = Array.isArray(obj.guardian) ? obj.guardian : [];
      return obj;
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};

export const getAllTeachers = async (req, res) => {
  try {
    const { requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    let teachers = await Teacher.find({}, '-password -__v -guardianIds -quizIds');
    teachers = teachers.map(t => {
      const obj = t.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      // Set photo as base64 data URL or null
      if (obj.photo && obj.photo.data) {
        obj.photo = `data:${obj.photo.contentType};base64,${obj.photo.data.toString('base64')}`;
      } else {
        obj.photo = null;
      }
      return obj;
    });
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teachers', error: err.message });
  }
};

export const getAllGuardians = async (req, res) => {
  try {
    const { requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    let guardians = await Guardian.find({}, '-password -__v -guardianIds -quizIds');
    guardians = guardians.map(g => {
      const obj = g.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      // Set photo as base64 data URL or null
      if (obj.photo && obj.photo.data) {
        obj.photo = `data:${obj.photo.contentType};base64,${obj.photo.data.toString('base64')}`;
      } else {
        obj.photo = null;
      }
      // Ensure child array is present
      obj.child = Array.isArray(obj.child) ? obj.child : [];
      return obj;
    });
    res.json({ guardians });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching guardians', error: err.message });
  }
};