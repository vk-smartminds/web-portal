import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Guardian from '../models/Guardian.js';
import Teacher from '../models/Teacher.js';
import Session from '../models/Session.js';

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
    let user = await Student.findOne({ email: email.trim().toLowerCase() }).select('-password -__v -profileVisibility -notificationSettings');
    if (!user) user = await Guardian.findOne({ email: email.trim().toLowerCase() }).select('-password -__v -profileVisibility -notificationSettings');
    if (!user) user = await Teacher.findOne({ email: email.trim().toLowerCase() }).select('-password -__v -profileVisibility -notificationSettings');
    if (!user) user = await Admin.findOne({ email: email.trim().toLowerCase() }).select('-password -__v -profileVisibility -notificationSettings');
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
    let user = await Student.findOne({ email: email.trim().toLowerCase() }).select('-password -__v -profileVisibility -notificationSettings');
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
    let user = await Teacher.findOne({ email: email.trim().toLowerCase() }).select('-password -__v -profileVisibility -notificationSettings');
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
    let user = await Guardian.findOne({ email: email.trim().toLowerCase() }).select('-password -__v -profileVisibility -notificationSettings');
    if (!user) return res.status(404).json({ message: 'Guardian not found' });
    user = user.toObject();
    user.child = Array.isArray(user.child) ? user.child : [];
    
    // Update child class information if missing
    for (const child of user.child) {
      if (!child.class || child.class === '') {
        // Fetch class from Student schema using child email
        const student = await Student.findOne({ email: child.email });
        if (student && student.class) {
          child.class = student.class;
        } else {
          child.class = '';
        }
      }
    }
    
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
    let students = await Student.find({}, '-password -__v -guardianIds -quizIds -profileVisibility -notificationSettings');
    students = students.map(s => {
      const obj = s.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      delete obj.profileVisibility;
      delete obj.notificationSettings;
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
    let teachers = await Teacher.find({}, '-password -__v -guardianIds -quizIds -profileVisibility -notificationSettings');
    teachers = teachers.map(t => {
      const obj = t.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      delete obj.profileVisibility;
      delete obj.notificationSettings;
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
    let guardians = await Guardian.find({}, '-password -__v -guardianIds -quizIds -profileVisibility -notificationSettings');
    
    // Process guardians and update child class information
    const processedGuardians = [];
    for (const g of guardians) {
      const obj = g.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      delete obj.profileVisibility;
      delete obj.notificationSettings;
      // Set photo as base64 data URL or null
      if (obj.photo && obj.photo.data) {
        obj.photo = `data:${obj.photo.contentType};base64,${obj.photo.data.toString('base64')}`;
      } else {
        obj.photo = null;
      }
      // Ensure child array is present and update missing class information
      obj.child = Array.isArray(obj.child) ? obj.child : [];
      
      // Update child class information if missing
      for (const child of obj.child) {
        if (!child.class || child.class === '') {
          // Fetch class from Student schema using child email
          const student = await Student.findOne({ email: child.email });
          if (student && student.class) {
            child.class = student.class;
          } else {
            child.class = '';
          }
        }
      }
      processedGuardians.push(obj);
    }
    
    res.json({ guardians: processedGuardians });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching guardians', error: err.message });
  }
};

// New: Allow any admin to fetch all students
export const getAllStudentsForAdmin = async (req, res) => {
  try {
    const { requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester) {
      return res.status(403).json({ message: 'Forbidden: Only admin can perform this action.' });
    }
    let students = await Student.find({}, '-password -__v -guardianIds -quizIds -profileVisibility -notificationSettings');
    students = students.map(s => {
      const obj = s.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      delete obj.profileVisibility;
      delete obj.notificationSettings;
      if (obj.photo && obj.photo.data) {
        obj.photo = `data:${obj.photo.contentType};base64,${obj.photo.data.toString('base64')}`;
      } else {
        obj.photo = null;
      }
      obj.guardian = Array.isArray(obj.guardian) ? obj.guardian : [];
      return obj;
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};

// New: Allow any admin to fetch all teachers
export const getAllTeachersForAdmin = async (req, res) => {
  try {
    const { requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester) {
      return res.status(403).json({ message: 'Forbidden: Only admin can perform this action.' });
    }
    let teachers = await Teacher.find({}, '-password -__v -guardianIds -quizIds -profileVisibility -notificationSettings');
    teachers = teachers.map(t => {
      const obj = t.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      delete obj.profileVisibility;
      delete obj.notificationSettings;
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

// New: Allow any admin to fetch all guardians
export const getAllGuardiansForAdmin = async (req, res) => {
  try {
    const { requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester) {
      return res.status(403).json({ message: 'Forbidden: Only admin can perform this action.' });
    }
    let guardians = await Guardian.find({}, '-password -__v -guardianIds -quizIds -profileVisibility -notificationSettings');
    const processedGuardians = [];
    for (const g of guardians) {
      const obj = g.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      delete obj.profileVisibility;
      delete obj.notificationSettings;
      if (obj.photo && obj.photo.data) {
        obj.photo = `data:${obj.photo.contentType};base64,${obj.photo.data.toString('base64')}`;
      } else {
        obj.photo = null;
      }
      obj.child = Array.isArray(obj.child) ? obj.child : [];
      for (const child of obj.child) {
        if (!child.class || child.class === '') {
          const student = await Student.findOne({ email: child.email });
          if (student && student.class) {
            child.class = student.class;
          } else {
            child.class = '';
          }
        }
      }
      processedGuardians.push(obj);
    }
    res.json({ guardians: processedGuardians });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching guardians', error: err.message });
  }
};

// Fetch students by class (superadmin only)
export const getStudentsByClass = async (req, res) => {
  try {
    const { class: className, requesterEmail } = req.body;
    const requester = await Admin.findOne({ email: requesterEmail });
    if (!requester || !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Forbidden: Only superadmin can perform this action.' });
    }
    if (!className) {
      return res.status(400).json({ message: 'Class is required' });
    }
    // Case-insensitive class match
    let students = await Student.find({ class: { $regex: `^${className}$`, $options: 'i' } }, '-password -__v -guardianIds -quizIds -profileVisibility -notificationSettings');
    students = students.map(s => {
      const obj = s.toObject();
      delete obj.quizIds;
      delete obj.guardianIds;
      delete obj.profileVisibility;
      delete obj.notificationSettings;
      if (obj.photo && obj.photo.data) {
        obj.photo = `data:${obj.photo.contentType};base64,${obj.photo.data.toString('base64')}`;
      } else {
        obj.photo = null;
      }
      obj.guardian = Array.isArray(obj.guardian) ? obj.guardian : [];
      return obj;
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students by class', error: err.message });
  }
};

// Get login activity for a user by userId and userRole (superadmin only)
export const getUserLoginActivity = async (req, res) => {
  try {
    const { userId, userRole } = req.body;
    if (!userId || !userRole) {
      return res.status(400).json({ message: 'Missing userId or userRole' });
    }
    const sessions = await Session.find({ userId, userRole }).sort({ 'login.timestamp': -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching login activity', error: err.message });
  }
};

// Get all sessions (for login statistics)
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({});
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions', error: err.message });
  }
};

// Helper to get user by id and role
async function getUserByIdAndRole(userId, userRole) {
  if (!userId || !userRole) return null;
  let user = null;
  if (userRole === 'Student') user = await Student.findById(userId);
  else if (userRole === 'Teacher') user = await Teacher.findById(userId);
  else if (userRole === 'Guardian') user = await Guardian.findById(userId);
  else if (userRole === 'Admin') user = await Admin.findById(userId);
  return user;
}

// API: Get user basic info (email, name) by id and role
export const getUserBasicInfo = async (req, res) => {
  try {
    const { userId, userRole } = req.body;
    const user = await getUserByIdAndRole(userId, userRole);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ email: user.email || '', name: user.name || '' });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user info', error: err.message });
  }
};