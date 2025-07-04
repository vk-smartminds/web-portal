import Student from '../models/Student.js';
import Guardian from '../models/Guardian.js';
import Teacher from '../models/Teacher.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { generateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const otpStore = {};
const loginOtpStore = {};
const childOtpStore = {}; // Store OTPs for child (student) email verification
const verifiedChildEmails = {}; // Store verified child emails for guardian registration
const childVerificationTokens = {}; // token: { email, expires }

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

// Check for email credentials
if (!emailUser || !emailPass) {
  console.error('EMAIL_USER or EMAIL_PASS is not set in environment variables.');
}

let transporter = null;
if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for 587
    auth: { user: emailUser, pass: emailPass }
  });
  // Verify transporter at startup
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

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Registration ---
export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    // Check all user tables for existing email
    const [existingStudent, existingTeacher, existingGuardian, existingAdmin] = await Promise.all([
      Student.findOne({ email: cleanEmail }),
      Teacher.findOne({ email: cleanEmail }),
      Guardian.findOne({ email: cleanEmail }),
      Admin.findOne({ email: cleanEmail })
    ]);
    // Block if email exists in any user table
    if (existingStudent || existingTeacher || existingGuardian || existingAdmin) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }
    const otp = generateOtp();
    otpStore[cleanEmail] = { otp, expires: Date.now() + 3 * 60 * 1000 };
    if (!transporter) {
      return res.status(500).json({ message: 'Email service not configured. Please contact support.' });
    }
    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Registration OTP',
      text: `Your OTP for registration is: ${otp}`
    });
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Failed to send OTP to', req.body.email, '\nError:', err, '\nStack:', err.stack);
    res.status(500).json({ message: 'Failed to send OTP', error: err.message, detail: err.response });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, school, class: userClass, phone, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Check all user tables for existing email
    const [existingStudent, existingTeacher, existingGuardian, existingAdmin] = await Promise.all([
      Student.findOne({ email: cleanEmail }),
      Teacher.findOne({ email: cleanEmail }),
      Guardian.findOne({ email: cleanEmail }),
      Admin.findOne({ email: cleanEmail })
    ]);
    if (existingStudent || existingTeacher || existingGuardian || existingAdmin) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({
      name,
      email: cleanEmail,
      password: hashedPassword,
      school,
      class: userClass,
      phone: phone || ""
    });
    await student.save();
    delete otpStore[cleanEmail];
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const registerGuardian = async (req, res) => {
  try {
    const { email, password, otp, child, role } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    // Child email is required and must be a non-empty string
    if (!child || !Array.isArray(child) || child.length === 0 || !child[0]) {
      return res.status(400).json({ message: 'Child email is required for Guardian registration' });
    }
    const childEmail = child[0].trim().toLowerCase();
    // Validate child verification token from cookie
    const token = req.cookies.vk_child_verified;
    if (!token || !childVerificationTokens[token]) {
      return res.status(400).json({ message: 'Child email must be verified via OTP before Guardian registration' });
    }
    const tokenData = childVerificationTokens[token];
    if (tokenData.email !== childEmail || tokenData.expires < Date.now()) {
      return res.status(400).json({ message: 'Child email verification expired or does not match' });
    }
    // Guardian OTP verification
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Check all user tables for existing email
    const [existingStudent, existingTeacher, existingGuardian, existingAdmin] = await Promise.all([
      Student.findOne({ email: cleanEmail }),
      Teacher.findOne({ email: cleanEmail }),
      Guardian.findOne({ email: cleanEmail }),
      Admin.findOne({ email: cleanEmail })
    ]);
    // Only block if email exists in Student, Teacher, or Admin
    if (existingStudent || existingTeacher || existingAdmin) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    if (existingGuardian) {
      // Add new child to existing guardian if not already present
      const alreadyLinked = existingGuardian.child.some(c => c.email === childEmail);
      if (!alreadyLinked) {
        existingGuardian.child.push({ email: childEmail, role });
        await existingGuardian.save();
      }
      delete otpStore[cleanEmail];
      delete childVerificationTokens[token];
      res.clearCookie('vk_child_verified');
      return res.status(200).json({ message: 'Child added to existing guardian account' });
    }
    // Create new guardian
    const guardian = new Guardian({
      email: cleanEmail,
      password: hashedPassword,
      userRole: 'Guardian',
      child: [{ email: childEmail, role }]
    });
    await guardian.save();
    delete otpStore[cleanEmail];
    delete childVerificationTokens[token];
    res.clearCookie('vk_child_verified');
    res.status(201).json({ message: 'Guardian registered successfully' });
  } catch (err) {
    console.error('Guardian registration failed:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, school, phone, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = otpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Check all user tables for existing email
    const [existingStudent, existingTeacher, existingGuardian, existingAdmin] = await Promise.all([
      Student.findOne({ email: cleanEmail }),
      Teacher.findOne({ email: cleanEmail }),
      Guardian.findOne({ email: cleanEmail }),
      Admin.findOne({ email: cleanEmail })
    ]);
    console.log('DEBUG registerTeacher: existingGuardian =', existingGuardian);
    if (existingStudent || existingTeacher || existingGuardian || existingAdmin) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      name,
      email: cleanEmail,
      password: hashedPassword,
      school,
      phone: phone || ""
    });
    await teacher.save();
    delete otpStore[cleanEmail];
    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// --- Login ---
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const student = await Student.findOne({ email: cleanEmail });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
    const token = generateToken(student._id, 'student');
    // Remove cookie logic for students, only return token in response (frontend uses localStorage)
    res.status(200).json({ message: "Login successful", token, user: { id: student._id, email: student.email, role: 'student', name: student.name } });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const loginGuardian = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const guardian = await Guardian.findOne({ email: cleanEmail });
    if (!guardian) return res.status(404).json({ message: "Guardian not found" });
    const isMatch = await bcrypt.compare(password, guardian.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
    const token = generateToken(guardian._id, 'guardian');
    res.status(200).json({ message: "Login successful", token, user: { id: guardian._id, email: guardian.email, role: 'guardian', name: guardian.name, guardianRole: guardian.role } });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const teacher = await Teacher.findOne({ email: cleanEmail });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });
    const token = generateToken(teacher._id, 'teacher');
    res.status(200).json({ message: "Login successful", token, user: { id: teacher._id, email: teacher.email, role: 'teacher', name: teacher.name } });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// --- OTP Login for Student ---
// Removed old role-specific OTP login and verification endpoints
// --- OTP Login for Guardian ---
// Removed old role-specific OTP login and verification endpoints
// --- OTP Login for Teacher ---
// Removed old role-specific OTP login and verification endpoints

// --- Child Email OTP for Guardian Registration ---
export const sendChildOtp = async (req, res) => {
  try {
    const { childEmail } = req.body;
    if (!childEmail || !childEmail.trim()) {
      return res.status(400).json({ message: 'Child email is required' });
    }
    const cleanChildEmail = childEmail.trim().toLowerCase();
    // Check if student exists
    const student = await Student.findOne({ email: cleanChildEmail });
    if (!student) return res.status(404).json({ message: 'Student (child) not found' });
    const otp = generateOtp();
    childOtpStore[cleanChildEmail] = { otp, expires: Date.now() + 3 * 60 * 1000 };
    await transporter.sendMail({
      from: emailUser,
      to: cleanChildEmail,
      subject: 'VK Publications Guardian Registration - Child Email OTP',
      text: `Your OTP for linking your account to a Guardian is: ${otp}`
    });
    res.json({ message: 'OTP sent to child email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP to child', error: err.message });
  }
};

export const verifyChildOtp = async (req, res) => {
  try {
    const { childEmail, otp } = req.body;
    if (!childEmail || !childEmail.trim()) {
      return res.status(400).json({ message: 'Child email is required' });
    }
    const cleanChildEmail = childEmail.trim().toLowerCase();
    const record = childOtpStore[cleanChildEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Generate a random token and set as httpOnly cookie
    const token = crypto.randomBytes(32).toString('hex');
    childVerificationTokens[token] = { email: cleanChildEmail, expires: Date.now() + 10 * 60 * 1000 };
    res.cookie('vk_child_verified', token, {
      httpOnly: true,
      secure: false, // Always false for local development (http)
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000 // 10 minutes
    });
    delete childOtpStore[cleanChildEmail];
    res.json({ message: 'Child email verified' });
  } catch (err) {
    res.status(500).json({ message: 'Child OTP verification failed', error: err.message });
  }
};

// Helper to get model by email
async function getModelAndUserByEmail(email) {
  let user = await Student.findOne({ email });
  if (user) return { Model: Student, user };
  user = await Teacher.findOne({ email });
  if (user) return { Model: Teacher, user };
  user = await Guardian.findOne({ email });
  if (user) return { Model: Guardian, user };
  user = await Admin.findOne({ email });
  if (user) return { Model: Admin, user };
  return { Model: null, user: null };
}

// Delete user by role and id (JWT protected, user can delete their own account)
export const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const cleanEmail = email.trim().toLowerCase();
    const { Model, user } = await getModelAndUserByEmail(cleanEmail);
    if (!Model || !user) {
      return res.status(404).json({ message: "User not found" });
    }
    await Model.deleteOne({ email: cleanEmail });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
};

export const checkChildVerified = (req, res) => {
  try {
    const { childEmail } = req.query;
    const token = req.cookies.vk_child_verified;
    if (!token || !childVerificationTokens[token]) {
      return res.json({ verified: false });
    }
    const tokenData = childVerificationTokens[token];
    if (tokenData.email !== childEmail.trim().toLowerCase() || tokenData.expires < Date.now()) {
      return res.json({ verified: false });
    }
    return res.json({ verified: true });
  } catch {
    return res.json({ verified: false });
  }
};

// --- Unified OTP Login Verification for All User Types ---
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    const record = loginOtpStore[cleanEmail];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    // Check all user tables for the email
    const [student, teacher, guardian, admin] = await Promise.all([
      Student.findOne({ email: cleanEmail }),
      Teacher.findOne({ email: cleanEmail }),
      Guardian.findOne({ email: cleanEmail }),
      Admin.findOne({ email: cleanEmail })
    ]);
    let user = null;
    let role = null;
    let token = null;
    if (student) {
      user = student;
      role = 'student';
      token = generateToken(student._id, 'student');
    } else if (teacher) {
      user = teacher;
      role = 'teacher';
      token = generateToken(teacher._id, 'teacher');
    } else if (guardian) {
      user = guardian;
      role = 'guardian';
      token = generateToken(guardian._id, 'guardian');
    } else if (admin) {
      user = admin;
      role = 'admin';
      token = generateToken(admin._id, 'admin');
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
    delete loginOtpStore[cleanEmail];
    // Return user info based on role
    let userInfo = { id: user._id, email: user.email, role, name: user.name };
    if (role === 'guardian') userInfo.guardianRole = user.role;
    res.json({ message: 'OTP verified', token, user: userInfo });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

// --- Unified OTP Send for All User Types ---
export const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    // Check all user tables for the email
    const [student, teacher, guardian, admin] = await Promise.all([
      Student.findOne({ email: cleanEmail }),
      Teacher.findOne({ email: cleanEmail }),
      Guardian.findOne({ email: cleanEmail }),
      Admin.findOne({ email: cleanEmail })
    ]);
    let user = student || teacher || guardian || admin;
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = generateOtp();
    loginOtpStore[cleanEmail] = { otp, expires: Date.now() + 2 * 60 * 1000 };
    if (!transporter) {
      return res.status(500).json({ message: 'Email service not configured. Please contact support.' });
    }
    await transporter.sendMail({
      from: emailUser,
      to: cleanEmail,
      subject: 'VK Publications Login OTP',
      text: `Your OTP for login is: ${otp}`
    });
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

// ...add more as needed for profile, etc.
