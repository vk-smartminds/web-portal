import Student from '../models/Student.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js';

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

export default { sendOtp, register, find };
