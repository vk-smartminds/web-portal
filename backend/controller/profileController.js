import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Guardian from '../models/Guardian.js';
import Teacher from '../models/Teacher.js';
import multer from 'multer';
import path from 'path';

// Setup multer storage (reuse from userController if needed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'backend', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});
export const upload = multer({ storage });

// Helper to get model by role
function getModelByRole(role) {
  if (role === 'student') return Student;
  if (role === 'guardian') return Guardian;
  if (role === 'teacher') return Teacher;
  if (role === 'admin') return Admin;
  return null;
}

// GET /api/profile - Get user profile (JWT authenticated)
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });
    let userObj = user.toObject ? user.toObject() : user;
    if (userObj.photo && userObj.photo.data) {
      userObj.photo = `data:${userObj.photo.contentType};base64,${userObj.photo.data.toString('base64')}`;
    } else {
      userObj.photo = null;
    }
    // If guardian, fetch latest class for each child from Student schema
    if (userObj.userRole === 'Guardian' && Array.isArray(userObj.child)) {
      const updatedChildren = await Promise.all(userObj.child.map(async (child) => {
        if (!child.email) return { ...child, class: child.class || 'Not specified', role: child.role };
        const student = await Student.findOne({ email: child.email });
        return {
          email: child.email,
          class: student ? student.class : (child.class || 'Not specified'),
          role: child.role
        };
      }));
      userObj.child = updatedChildren;
    }
    res.json({ user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// PUT /api/profile - Update user profile (JWT authenticated)
export const updateProfile = async (req, res) => {
  try {
    let body = req.body;
    const userId = req.user._id;
    const role = req.user.role || (req.user.isSuperAdmin !== undefined || req.user.isAdmin ? 'admin' : null);
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid user role' });
    const update = {};
    if (typeof body.name !== 'undefined') update.name = body.name;
    if (typeof body.phone !== 'undefined') update.phone = body.phone;
    if ((role === 'student' || role === 'teacher') && typeof body.school !== 'undefined') update.school = body.school;
    if (role === 'student' && typeof body.class !== 'undefined') update.class = body.class;
    if (role === 'student' && typeof body.username !== 'undefined') update.username = body.username;
    // Allow guardians to update their role (Father, Mother, Guardian)
    if (role === 'guardian' && typeof body.role !== 'undefined') update.role = body.role;
    if (body.deletePhoto === true || body.deletePhoto === 'true') {
      update.photo = { data: undefined, contentType: undefined };
    } else if (req.file) {
      update.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    const user = await Model.findByIdAndUpdate(userId, { $set: update }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    let userObj = user.toObject();
    if (userObj.photo && userObj.photo.data) {
      userObj.photo = `data:${userObj.photo.contentType};base64,${userObj.photo.data.toString('base64')}`;
    } else {
      userObj.photo = null;
    }
    res.json({ message: 'Profile updated', user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// GET /api/verify-token - Verify JWT token and return user profile
export const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    let userObj = user.toObject ? user.toObject() : user;
    if (userObj.photo && userObj.photo.data) {
      userObj.photo = `data:${userObj.photo.contentType};base64,${userObj.photo.data.toString('base64')}`;
    } else {
      userObj.photo = null;
    }
    res.json({ 
      message: 'Token verified',
      user: userObj
    });
  } catch (err) {
    res.status(500).json({ message: 'Token verification failed', error: err.message });
  }
};

// GET /api/userinfo?model=Student|Teacher|Guardian|Admin&id=<id>
export const getUserInfoById = async (req, res) => {
  try {
    const { model, id } = req.query;
    if (!model || !id) return res.status(400).json({ message: 'model and id are required' });
    let Model;
    if (model === 'Student') Model = Student;
    else if (model === 'Teacher') Model = Teacher;
    else if (model === 'Guardian') Model = Guardian;
    else if (model === 'Admin') Model = Admin;
    else return res.status(400).json({ message: 'Invalid model' });
    const user = await Model.findById(id).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // For students/teachers, role is their type
    let role = user.role || model;
    res.json({ name: user.name, role, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user info', error: err.message });
  }
};
