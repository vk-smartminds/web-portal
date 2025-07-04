import express from 'express';
import { sendRegisterOtp,verifyRegisterOtp,registerStudent,registerGuardian,registerTeacher,loginStudent,loginGuardian,loginTeacher,deleteUser,sendChildOtp,verifyChildOtp,checkChildVerified,verifyLoginOtp,sendLoginOtp } from '../controller/authController.js';
import { getProfile, updateProfile, upload, verifyToken, getUserInfoById } from '../controller/profileController.js';
import { getAdmins, addAdmin, removeAdmin, isAdmin, adminLogin, checkSuperAdmin } from '../controller/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import studentController from '../controller/studentController.js';
import teacherController from '../controller/teacherController.js';
import { findUserByEmail as manageFindUserByEmail, deleteUserByEmail as manageDeleteUserByEmail } from '../controller/manageUserController.js';
import { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, announcementUpload, removeAnnouncementImage, markAnnouncementAsViewed } from '../controller/announcementController.js';
import { getCbseUpdates } from '../controller/cbseController.js';
import { addMindMap, getMindMaps, deleteMindMap, mindMapUpload, updateMindMap } from '../controller/mindMapController.js';
import { addAVLR, getAVLRs, updateAVLR, deleteAVLR } from '../controller/avlrController.js';
import { createDLR, getDLRs, updateDLR, deleteDLR, removeDLRPdf, dlrUpload } from '../controller/dlrController.js';
import { addCreativeItem, getCreativeItems, deleteCreativeItem, creativeCornerUpload, updateCreativeItem } from '../controller/creativeCornerController.js';
import { verifyChildEmail, verifyChildOtp as verifyGuardianChildOtp } from '../controller/guardianController';
import { checkGuardianEmail, validateGuardianPassword } from '../controller/guardianController';
import * as discussionController from '../controller/discussionController.js';
import { threadUpload, postUpload, getDiscussionNotifications, markDiscussionNotificationRead, deleteDiscussionNotification } from '../controller/discussionController.js';
import { deleteAccount } from '../controller/deleteAccountController.js';

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

// Public routes
router.post('/api/send-register-otp', sendRegisterOtp);
router.post('/api/verify-register-otp', verifyRegisterOtp);
router.post('/api/send-child-otp', sendChildOtp);
router.post('/api/verify-child-otp', verifyChildOtp);

// Registration
router.post('/api/register-student', registerStudent);
router.post('/api/register-guardian', registerGuardian);
router.post('/api/register-teacher', registerTeacher);

// Login
router.post('/api/login-student', loginStudent);
router.post('/api/login-guardian', loginGuardian);
router.post('/api/login-teacher', loginTeacher);

// OTP Login
router.post('/api/verify-login-otp', verifyLoginOtp); // Unified OTP login verification for all user types

// Unified OTP send endpoint for all user types
router.post('/api/send-login-otp', sendLoginOtp);

// Student routes
router.post('/api/student/send-otp', studentController.sendOtp);
router.post('/api/student/register', studentController.register);
router.post('/api/student/find', studentController.find);

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

// Admin routes
router.get('/api/getadmins', getAdmins);
router.post('/api/isadmin', isAdmin);
router.post('/api/addadmins', addAdmin);
router.delete('/api/removeadmin', removeAdmin);
router.post('/api/admin/login', adminLogin); // Secure admin login route
router.post('/api/check-superadmin', checkSuperAdmin);
router.post('/api/admin/find-user', manageFindUserByEmail); // Superadmin only
router.delete('/api/admin/delete-user', manageDeleteUserByEmail); // Superadmin only

// Announcement routes (RESTful, explicit)
router.post('/api/addannouncement', authenticateToken, announcementUpload.array('images', 5), createAnnouncement);
router.get('/api/getannouncements', authenticateToken, getAnnouncements);
router.put('/api/updateannouncement/:id', authenticateToken, announcementUpload.array('images', 5), updateAnnouncement);
router.delete('/api/removeannouncement/:id', authenticateToken, deleteAnnouncement);
router.put('/api/announcement/:id/remove-image', authenticateToken, removeAnnouncementImage);
router.post('/api/announcement/:announcementId/view', authenticateToken, markAnnouncementAsViewed);

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

// Creative Corner routes
router.post('/api/creative-corner', authenticateToken, creativeCornerUpload.array('files', 10), addCreativeItem);
router.get('/api/creative-corner', getCreativeItems);
router.put('/api/creative-corner/:id', authenticateToken, creativeCornerUpload.array('files', 10), updateCreativeItem);
router.delete('/api/creative-corner/:id', authenticateToken, deleteCreativeItem);


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

// Discussion notification routes
router.get('/api/discussion/notifications', authenticateToken, getDiscussionNotifications);
router.post('/api/discussion/notifications/:id/read', authenticateToken, markDiscussionNotificationRead);
router.delete('/api/discussion/notifications/:id', authenticateToken, deleteDiscussionNotification);


export default router;
