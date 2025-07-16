import express from 'express';
import { sendRegisterOtp,verifyRegisterOtp,registerStudent,registerGuardian,registerTeacher,loginStudent,loginGuardian,loginTeacher,deleteUser,sendChildOtp,verifyChildOtp,checkChildVerified,verifyLoginOtp,sendLoginOtp, loginUser } from '../controller/authController.js';
import { getProfile, updateProfile, upload, verifyToken, getUserInfoById } from '../controller/profileController.js';
import { getAdmins, addAdmin, removeAdmin, isAdmin, adminLogin, checkSuperAdmin } from '../controller/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import studentController from '../controller/studentController.js';
import teacherController from '../controller/teacherController.js';
import { findUserByEmail as manageFindUserByEmail, deleteUserByEmail as manageDeleteUserByEmail, findStudentByEmail, findTeacherByEmail, findGuardianByEmail, getAllStudents, getAllTeachers, getAllGuardians, getUserLoginActivity, getAllSessions, getUserBasicInfo, getAllStudentsForAdmin, getAllTeachersForAdmin, getAllGuardiansForAdmin, getStudentsByClass } from '../controller/manageUserController.js';
import { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, announcementUpload, removeAnnouncementImage, markAnnouncementAsViewed, getAnnouncementFile } from '../controller/announcementController.js';
import { getCbseUpdates } from '../controller/cbseController.js';
import { addMindMap, getMindMaps, deleteMindMap, mindMapUpload, updateMindMap, getMindMapPdf } from '../controller/mindMapController.js';
import { addAVLR, getAVLRs, updateAVLR, deleteAVLR } from '../controller/avlrController.js';
import { createDLR, getDLRs, updateDLR, deleteDLR, removeDLRPdf, dlrUpload, getDlrPdf } from '../controller/dlrController.js';
import { addCreativeItem, getCreativeItems, deleteCreativeItem, creativeCornerUpload, updateCreativeItem, getCreativeCornerFile } from '../controller/creativeCornerController.js';
import { verifyChildEmail, verifyChildOtp as verifyGuardianChildOtp } from '../controller/guardianController';
import { checkGuardianEmail, validateGuardianPassword } from '../controller/guardianController';
import * as discussionController from '../controller/discussionController.js';
import { threadUpload, postUpload } from '../controller/discussionController.js';
import { deleteAccount } from '../controller/deleteAccountController.js';
import * as forgotPasswordController from '../controller/forgotPasswordController.js';
import { changePassword } from '../controller/passwordController.js';
import * as alternativeEmailController from '../controller/alternativeEmailController.js';
import * as privacyController from '../controller/privacyController.js';
import * as notificationSettingsController from '../controller/notificationSettingsController.js';
import * as loginActivityController from '../controller/loginActivityController.js';
import { getStudentById, getStudentPhoto } from '../controller/studentController.js';//let's have a check on it
import { createSqp, getSqps, updateSqp, deleteSqp, sqpUpload, getSqpPdf } from '../controller/sqpController.js';
import { createPyq, getPyqs, updatePyq, deletePyq, pyqUpload, getPyqPdf } from '../controller/pyqController.js';
import { createPyp, getPyps, updatePyp, deletePyp, pypUpload, getPypPdf } from '../controller/pypController.js';
import * as notificationController from '../controller/notificationController.js';
import * as screenTimeController from '../controller/screenTimeController.js';
import * as trackScreenTimeController from '../controller/trackScreenTimeController.js';

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

// Public routes
router.post('/api/send-register-otp', sendRegisterOtp);
router.post('/api/verify-register-otp', verifyRegisterOtp);
router.post('/api/send-child-otp', sendChildOtp);
router.post('/api/verify-child-otp', verifyChildOtp);

// Forgot Password routes
router.post('/api/forgot-password/send-otp', forgotPasswordController.sendForgotPasswordOtp);
router.post('/api/forgot-password/verify-otp', forgotPasswordController.verifyForgotPasswordOtp);
router.post('/api/forgot-password/reset', forgotPasswordController.resetPassword);

// Registration
router.post('/api/register-student', registerStudent);
router.post('/api/register-guardian', registerGuardian);
router.post('/api/register-teacher', registerTeacher);

// Login
router.post('/api/login-student', loginStudent);
router.post('/api/login-guardian', loginGuardian);
router.post('/api/login-teacher', loginTeacher);
router.post('/api/login', loginUser);

// OTP Login
router.post('/api/verify-login-otp', verifyLoginOtp); // Unified OTP login verification for all user types

// Unified OTP send endpoint for all user types
router.post('/api/send-login-otp', sendLoginOtp);

// Student routes
router.post('/api/student/send-otp', studentController.sendOtp);
router.post('/api/student/register', studentController.register);
router.post('/api/student/find', studentController.find);
router.get('/api/student/class/:id', studentController.getClassByStudentId); // New endpoint for fetching student class by student ID
router.get('/api/student/:id', studentController.getStudentById);
router.get('/api/student/:id/photo', studentController.getStudentPhoto);

// Teacher routes
router.post('/api/teacher/send-otp', teacherController.sendOtp);
router.post('/api/teacher/register', teacherController.register);
router.post('/api/teacher/find', teacherController.find);

// Protected routes (require JWT authentication)
router.get('/api/verify-token', authenticateToken, verifyToken);
router.get('/api/profile', authenticateToken, getProfile);
router.put('/api/profile', authenticateToken, memoryUpload.single('photo'), updateProfile);
router.post('/api/user/delete', authenticateToken, deleteUser);
router.delete('/api/delete-account', authenticateToken, deleteAccount);
router.post('/api/change-password', authenticateToken, changePassword);
router.post('/api/send-alt-email-otp', authenticateToken, alternativeEmailController.sendAltEmailOtp);
router.post('/api/verify-alt-email-otp', authenticateToken, alternativeEmailController.verifyAltEmailOtp);
router.get('/api/profile-visibility', authenticateToken, privacyController.getProfileVisibility);
router.put('/api/profile-visibility', authenticateToken, privacyController.updateProfileVisibility);

// Admin routes
router.get('/api/getadmins', getAdmins);
router.post('/api/isadmin', isAdmin);
router.post('/api/addadmins', addAdmin);
router.delete('/api/removeadmin', removeAdmin);
router.post('/api/admin/login', adminLogin); // Secure admin login route
router.post('/api/check-superadmin', checkSuperAdmin);
// Manage users (superadmin)
router.post('/api/admin/find-user', manageFindUserByEmail);
router.delete('/api/admin/delete-user', manageDeleteUserByEmail);
router.post('/api/admin/find-student', findStudentByEmail);
router.post('/api/admin/find-teacher', findTeacherByEmail);
router.post('/api/admin/find-guardian', findGuardianByEmail);
router.post('/api/admin/all-students', getAllStudentsForAdmin);
router.post('/api/admin/all-teachers', getAllTeachersForAdmin);
router.post('/api/admin/all-guardians', getAllGuardiansForAdmin);
router.post('/api/admin/user-login-activity', getUserLoginActivity);
router.post('/api/admin/user-basic-info', getUserBasicInfo);
router.get('/api/admin/all-sessions', getAllSessions);
router.post('/api/admin/students-by-class', getStudentsByClass);

// Announcement routes (RESTful, explicit)
router.post('/api/addannouncement', authenticateToken, announcementUpload.array('images', 5), createAnnouncement);
router.get('/api/getannouncements', authenticateToken, getAnnouncements);
router.put('/api/updateannouncement/:id', authenticateToken, announcementUpload.array('images', 5), updateAnnouncement);
router.delete('/api/removeannouncement/:id', authenticateToken, deleteAnnouncement);
router.put('/api/announcement/:id/remove-image', authenticateToken, removeAnnouncementImage);
router.post('/api/announcement/:announcementId/view', authenticateToken, markAnnouncementAsViewed);
router.get('/api/announcement/:id/file/:fileIndex', getAnnouncementFile);

// CBSE Updates route
router.get('/api/cbse-updates', getCbseUpdates);

// Check Child Verified route
router.get('/api/check-child-verified', checkChildVerified);

// Mind Map routes
router.post('/api/mindmap', authenticateToken, mindMapUpload.array('mindmap', 10), addMindMap);
router.get('/api/mindmaps', getMindMaps);
router.delete('/api/mindmap/:id', authenticateToken, deleteMindMap);
router.put('/api/mindmap/:id', authenticateToken, (req, res, next) => {
  mindMapUpload.array('mindmap', 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateMindMap);
router.get('/api/mindmap/:id/pdf/:pdfIndex', getMindMapPdf);

// AVLR routes
router.post('/api/avlr', authenticateToken, addAVLR);
router.get('/api/avlrs', getAVLRs);
router.put('/api/avlr/:id', authenticateToken, updateAVLR);
router.delete('/api/avlr/:id', authenticateToken, deleteAVLR);

// DLR routes
router.post('/api/dlr', dlrUpload.array('pdfs', 10), createDLR);
router.get('/api/dlrs', getDLRs);
router.put('/api/dlr/:id', dlrUpload.array('pdfs', 10), updateDLR);
router.delete('/api/dlr/:id', deleteDLR);
router.post('/api/dlr/:id/remove-pdf', removeDLRPdf);
router.get('/api/dlr/:id/pdf/:pdfIndex', getDlrPdf);

// Creative Corner routes
router.post('/api/creative-corner', authenticateToken, creativeCornerUpload.array('files', 10), addCreativeItem);
router.get('/api/creative-corner', getCreativeItems);
router.put('/api/creative-corner/:id', authenticateToken, creativeCornerUpload.array('files', 10), updateCreativeItem);
router.delete('/api/creative-corner/:id', authenticateToken, deleteCreativeItem);
router.get('/api/creative-corner/:id/file/:fileIndex', getCreativeCornerFile);

// SQP routes
router.post('/api/sqp', sqpUpload.array('pdfs', 10), createSqp);
router.get('/api/sqps', getSqps);
router.put('/api/sqp/:id', sqpUpload.array('pdfs', 10), updateSqp);
router.delete('/api/sqp/:id', deleteSqp);
router.get('/api/sqp/:id/pdf/:pdfIndex', getSqpPdf);
// PYQ routes
router.post('/api/pyq', pyqUpload.array('pdfs', 10), createPyq);
router.get('/api/pyqs', getPyqs);
router.put('/api/pyq/:id', pyqUpload.array('pdfs', 10), updatePyq);
router.delete('/api/pyq/:id', deletePyq);
router.get('/api/pyq/:id/pdf/:pdfIndex', getPyqPdf);
// PYP routes
router.post('/api/pyp', pypUpload.array('pdfs', 10), createPyp);
router.get('/api/pyps', getPyps);
router.put('/api/pyp/:id', pypUpload.array('pdfs', 10), updatePyp);
router.delete('/api/pyp/:id', deletePyp);
router.get('/api/pyp/:id/pdf/:pdfIndex', getPypPdf);

// User Info route
router.get('/api/userinfo', getUserInfoById);

// Serve announcement images
router.use('/uploads/announcements', express.static('backend/public/uploads/announcements'));

// Guardian routes
router.post('/api/guardian/verify-child-email', verifyChildEmail);
router.post('/api/guardian/verify-child-otp', verifyGuardianChildOtp);
router.post('/api/guardian/check-email', checkGuardianEmail);
router.post('/api/guardian/validate-password', validateGuardianPassword);


// Discussion routes
router.post('/api/discussion/threads', authenticateToken, threadUpload.array('images', 5), discussionController.createThread);
router.put('/api/discussion/threads/:threadId', authenticateToken, threadUpload.array('images', 5), discussionController.editThread);
router.delete('/api/discussion/threads/:threadId', authenticateToken, discussionController.deleteThread);
router.get('/api/discussion/threads', discussionController.getThreads);
router.get('/api/discussion/threads/:threadId', discussionController.getThread);
router.post('/api/discussion/threads/:threadId/posts', authenticateToken, postUpload.array('images', 5), discussionController.addPost);
router.put('/api/discussion/threads/:threadId/posts/:postId', authenticateToken, postUpload.array('images', 5), discussionController.editPost);
router.delete('/api/discussion/threads/:threadId/posts/:postId', authenticateToken, discussionController.deletePost);
router.post('/api/discussion/threads/:threadId/vote', authenticateToken, discussionController.voteThread);
router.post('/api/discussion/threads/:threadId/posts/:postId/vote', authenticateToken, discussionController.votePost);

// New route for searching posts
router.get('/api/discussion/posts/search', discussionController.searchPosts);

// Notification settings routes
router.get('/api/notification-settings', authenticateToken, notificationSettingsController.getNotificationSettings);
router.put('/api/notification-settings', authenticateToken, notificationSettingsController.updateNotificationSettings);

// Login activity route
router.get('/api/login-activity', authenticateToken, loginActivityController.getLoginActivity);
// Logout route
router.post('/api/logout', authenticateToken, loginActivityController.addLogoutEvent);
// --- QUIZ/QUESTION ADMIN & STUDENT ROUTES ---
import adminQuizRoutes from '../quiz/routes/adminQuizRoutes.js';
import quizRoutes from '../quiz/routes/quizRoutes.js';
router.use('/api/admin/quiz', adminQuizRoutes);
router.use('/api/quiz', quizRoutes);

// Notification API endpoints
router.get('/api/notifications', notificationController.getNotifications);
router.post('/api/notifications/mark-read', notificationController.markNotificationsRead);
router.get('/api/screen-time', authenticateToken, screenTimeController.getScreenTime);
router.post('/api/screen-time/increment', authenticateToken, screenTimeController.incrementScreenTime);
router.get('/api/screen-time/history', authenticateToken, screenTimeController.getScreenTimeHistory);
router.get('/api/track-screen-time', trackScreenTimeController.getScreenTime);


export default router;
