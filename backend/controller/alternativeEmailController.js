import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';
import nodemailer from 'nodemailer';

const altEmailOtpStore = {}; // { email: { otp, expires } }

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: emailUser, pass: emailPass }
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/send-alt-email-otp
export const sendAltEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;
    const { alternativeEmail } = req.body;
    if (!alternativeEmail) return res.status(400).json({ message: 'Alternative email is required.' });
    // Get model by role
    let Model;
    if (userRole === 'student') Model = Student;
    else if (userRole === 'teacher') Model = Teacher;
    else if (userRole === 'guardian') Model = Guardian;
    else if (userRole === 'admin') Model = Admin;
    else return res.status(400).json({ message: 'Invalid user role.' });
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.email === alternativeEmail) {
      return res.status(400).json({ message: 'Alternative email cannot be the same as your current email.' });
    }
    // Optionally: check if alt email is already used by another user
    // Send OTP
    const otp = generateOtp();
    altEmailOtpStore[alternativeEmail] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    await transporter.sendMail({
      from: emailUser,
      to: alternativeEmail,
      subject: 'VK Publications Alternative Email OTP',
      text: `Your OTP for alternative email verification is: ${otp}`
    });
    res.json({ message: 'OTP sent to alternative email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

// POST /api/verify-alt-email-otp
export const verifyAltEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;
    const { alternativeEmail, otp } = req.body;
    if (!alternativeEmail || !otp) return res.status(400).json({ message: 'Alternative email and OTP are required.' });
    // Get model by role
    let Model;
    if (userRole === 'student') Model = Student;
    else if (userRole === 'teacher') Model = Teacher;
    else if (userRole === 'guardian') Model = Guardian;
    else if (userRole === 'admin') Model = Admin;
    else return res.status(400).json({ message: 'Invalid user role.' });
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.email === alternativeEmail) {
      return res.status(400).json({ message: 'Alternative email cannot be the same as your current email.' });
    }
    const record = altEmailOtpStore[alternativeEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    // Update alternativeEmail
    user.alternativeEmail = alternativeEmail;
    await user.save();
    delete altEmailOtpStore[alternativeEmail];
    res.json({ message: 'Alternative email updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update alternative email', error: err.message });
  }
}; 