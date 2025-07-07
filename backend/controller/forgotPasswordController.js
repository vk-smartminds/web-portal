import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// In-memory OTP store: { email: { otp, expires, verified } }
const otpStore = {};

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

let transporter = null;
if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass }
  });
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Nodemailer transporter verification failed:', error);
    } else {
      console.log('Nodemailer transporter is ready to send emails.');
    }
  });
} else {
  console.error('Nodemailer transporter not created due to missing credentials.');
}

// Helper: Find user by email in all collections
async function findUserByEmail(email) {
  let user = await Admin.findOne({ email });
  if (user) return { user, model: Admin };
  user = await Student.findOne({ email });
  if (user) return { user, model: Student };
  user = await Teacher.findOne({ email });
  if (user) return { user, model: Teacher };
  user = await Guardian.findOne({ email });
  if (user) return { user, model: Guardian };
  return null;
}

// Helper: Send OTP using nodemailer
async function sendOtpToEmail(email, otp) {
  if (!transporter) {
    throw new Error('Email service not configured. Please contact support.');
  }
  await transporter.sendMail({
    from: emailUser,
    to: email,
    subject: 'VK Publications Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}`
  });
}

export async function sendForgotPasswordOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const found = await findUserByEmail(email);
  if (!found) return res.status(404).json({ message: 'User not found.' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000, // 5 min
    verified: false
  };
  await sendOtpToEmail(email, otp);
  return res.json({ message: 'OTP sent to your email.' });
}

export async function verifyForgotPasswordOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });
  const entry = otpStore[email];
  if (!entry) return res.status(400).json({ message: 'No OTP sent. Please request again.' });
  if (Date.now() > entry.expires) return res.status(400).json({ message: 'OTP expired.' });
  if (entry.otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
  entry.verified = true;
  return res.json({ message: 'OTP verified.' });
}

export async function resetPassword(req, res) {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ message: 'All fields are required.' });
  const entry = otpStore[email];
  if (!entry) return res.status(400).json({ message: 'No OTP sent. Please request again.' });
  if (!entry.verified) return res.status(400).json({ message: 'OTP not verified.' });
  if (Date.now() > entry.expires) return res.status(400).json({ message: 'OTP expired.' });
  const found = await findUserByEmail(email);
  if (!found) return res.status(404).json({ message: 'User not found.' });
  const hash = await bcrypt.hash(password, 10);
  found.user.password = hash;
  await found.user.save();
  delete otpStore[email];
  return res.json({ message: 'Password reset successful.' });
} 