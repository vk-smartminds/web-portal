import Teacher from '../models/Teacher.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import Admin from '../models/Admin.js';

const otpStore = {};

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

    // Block if already registered as Teacher
    const exists = await Teacher.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: 'Teacher email already registered.' });
    }

    const otp = generateOtp();
    otpStore[cleanEmail] = { otp, expires: Date.now() + 3 * 60 * 1000 };
    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Teacher Registration OTP',
      text: `Your OTP for teacher registration is: ${otp}`
    });
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, otp, password } = req.body;
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
    // Block if already registered as Teacher
    const exists = await Teacher.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: 'Teacher email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      name,
      email: cleanEmail,
      password: hashedPassword,
      school: "",
      phone: ""
    });
    await teacher.save();
    delete otpStore[cleanEmail];
    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Teacher registration failed', error: err.message });
  }
};

export const find = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const teacher = await Teacher.findOne({ email: cleanEmail });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ teacher });
  } catch (err) {
    res.status(500).json({ message: 'Error finding teacher', error: err.message });
  }
};

export default { sendOtp, register, find };
