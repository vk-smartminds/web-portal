import Student from '../models/Student.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js';

// Get student class by student ID
export const getClassByStudentId = async (req, res) => {
  try {
    // Only use the MongoDB ObjectId from the URL param 'id'
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid student ID', idReceived: id });
    }
    // Only search by _id field (convert to ObjectId)
    const student = await Student.findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!student) {
      return res.status(404).json({ message: 'Student not found', idReceived: id });
    }
    res.json({ class: student.class, _id: student._id });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student class', error: err.message });
  }
};

const otpStore = {}; // { email: { otp, expires } }

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check if email is an admin
    const isAdmin = await Admin.findOne({ email: cleanEmail });
    if (isAdmin) {
      return res.status(409).json({ message: 'You cannot use this email. It is an admin ID. Please use a different email.' });
    }

    // Block if already registered as Student
    const exists = await Student.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered as Student.' });
    }

    const otp = generateOtp();
    otpStore[cleanEmail] = { otp, expires: Date.now() + 3 * 60 * 1000 }; // 3 min
    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Student Registration OTP',
      text: `Your OTP for student registration is: ${otp}`
    });
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, school, class: userClass, otp, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    // Check if email is an admin
    const isAdmin = await Admin.findOne({ email: cleanEmail });
    if (isAdmin) {
      return res.status(409).json({ message: 'You cannot use this email. It is an admin ID. Please use a different email.' });
    }

    // OTP check
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Block if already registered as Student
    const exists = await Student.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered as Student.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      email: cleanEmail,
      password: hashedPassword,
      school,
      class: userClass,
      phone: ""
    });
    await student.save();
    delete otpStore[cleanEmail];
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Student registration failed', error: err.message });
  }
};

export const find = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const student = await Student.findOne({ email: cleanEmail });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: 'Error finding student', error: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid student ID', idReceived: id });
    }
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found', idReceived: id });
    }
    let profilePhotoUrl = '';
    if (student.photo && student.photo.data) {
      profilePhotoUrl = `/api/student/${student._id}/photo`;
    }
    res.json({
      _id: student._id,
      name: student.name,
      class: student.class,
      profilePhotoUrl
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student info', error: err.message });
  }
};

export const getStudentPhoto = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid student ID');
    }
    const student = await Student.findById(id);
    if (!student || !student.photo || !student.photo.data) {
      // Serve default avatar
      return res.sendFile('default-avatar.png', { root: 'backend/public' });
    }
    res.set('Content-Type', student.photo.contentType || 'image/png');
    res.send(student.photo.data);
  } catch (err) {
    res.status(500).send('Error fetching student photo');
  }
};

// Add getClassByStudentId to the default export for proper routing
export default { sendOtp, register, find, getClassByStudentId, getStudentById, getStudentPhoto };
