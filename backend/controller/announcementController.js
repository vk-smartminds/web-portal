import Announcement from '../models/Announcement.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendAnnouncementEmails } from './AnnouncementEmailController.js';
import AnnouncementView from '../models/AnnouncementView.js';

// Multer config for memory storage (buffer)
const storage = multer.memoryStorage();
export const announcementUpload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file (increased from 2MB)
    files: 10 // Allow up to 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept jpg/jpeg/png images and pdfs
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error(`File type ${file.mimetype} not allowed. Only jpg, png images and pdf files are allowed.`));
    }
    cb(null, true);
  }
});

// Create announcement (images and pdfs as Buffer)
export const createAnnouncement = async (req, res) => {
  try {
    // Check for multer errors
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }
    
    if (req.files && req.files.length > 0) {
      // Log file sizes for debugging
      req.files.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.originalname}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Type: ${file.mimetype}`);
      });
    }
    const { text, createdBy, classes, announcementFor } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: 'Announcement text is required' });
    }
    if (!announcementFor || !Array.isArray(announcementFor) || announcementFor.length === 0) {
      return res.status(400).json({ message: 'At least one announcementFor is required' });
    }
    // Normalize announcementFor for logic (lowercase)
    let announcementForArr = Array.isArray(announcementFor) ? announcementFor : [];
    const announcementForLower = announcementForArr.map(a => a && typeof a === 'string' ? a.trim().toLowerCase() : a);
    // For storage, capitalize first letter of each role
    const announcementForStored = announcementForLower.map(role => role.charAt(0).toUpperCase() + role.slice(1));
    let finalClasses = classes;
    if (announcementForLower.includes("student")) {
      if (!classes || !Array.isArray(classes) || classes.length === 0 || (classes.length === 1 && (!classes[0] || classes[0].trim() === ""))) {
        finalClasses = ["ALL"];
      } else {
        finalClasses = classes.map(c => c && typeof c === 'string' && c.trim().toLowerCase() === 'all' ? 'ALL' : c);
      }
    }
    if (Array.isArray(finalClasses)) {
      finalClasses = finalClasses.map(c => c && typeof c === 'string' && c.trim().toLowerCase() === 'all' ? 'ALL' : c);
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: f.mimetype === 'application/pdf' ? 'pdf' : 'image'
      }));
    }
    const creatorEmail = createdBy || (req.user && req.user.email);
    if (!creatorEmail) {
      return res.status(400).json({ message: 'Creator email is required' });
    }
    const announcement = await Announcement.create({
      text,
      images,
      classes: announcementForLower.includes("student") ? finalClasses : [],
      announcementFor: announcementForStored,
      createdBy: creatorEmail
    });
    
    // Send announcement emails
    try {
      const emailResult = await sendAnnouncementEmails(announcementForStored, finalClasses, text, creatorEmail);
      if (emailResult.emails && Array.isArray(emailResult.emails)) {
      }
    } catch (emailError) {
    }
    
    res.status(201).json({ message: 'Announcement created', announcement });
  } catch (err) {
    res.status(500).json({ message: 'Error creating announcement', error: err.message });
  }
};

// Get all announcements (convert images and pdfs to base64 or download link)
// Accepts optional ?class=10&registeredAs=Student parameter to filter
export const getAnnouncements = async (req, res) => {
  try {
    let studentClass = req.query.class;
    let registeredAs = req.query.registeredAs;
    let announcements = await Announcement.find({}).sort({ createdAt: -1 });

    // Get viewed announcements for this user (if authenticated)
    let viewedIds = [];
    if (req.user && req.user._id) {
      // Determine user type based on the user's role or model
      let userType = 'User'; // default
      if (req.user.isAdmin) {
        userType = 'Admin';
      } else if (req.user.role) {
        // Use the role from the user object (Student, Teacher, Guardian)
        // Ensure proper capitalization to match AnnouncementView schema
        const role = req.user.role.toLowerCase();
        if (role === 'student') userType = 'Student';
        else if (role === 'teacher') userType = 'Teacher';
        else if (role === 'guardian') userType = 'Guardian';
        else if (role === 'admin') userType = 'Admin';
        else userType = 'User';
      }
      
      const views = await AnnouncementView.find({ userId: req.user._id, userType });
      viewedIds = views.map(v => v.announcementId.toString());
    }

    // Filter by announcementFor
    if (registeredAs) {
      announcements = announcements.filter(a => {
        const roles = Array.isArray(a.announcementFor)
          ? a.announcementFor.map(role => (role || '').toLowerCase())
          : [];
        
        // Handle both 'parent' and 'guardian' roles
        if (roles.includes('parent') || roles.includes('guardian')) return true;
        
        if (
          studentClass &&
          roles.includes('student') &&
          Array.isArray(a.classes)
        ) {
          // Handle multiple classes (comma-separated)
          const requestedClasses = studentClass.split(',').map(c => c.trim());
          const announcementClasses = a.classes.map(c => (c || '').toLowerCase());
          
          // Check if any of the requested classes match the announcement classes
          const hasMatch = announcementClasses.includes('all') || 
            requestedClasses.some(reqClass => announcementClasses.includes(reqClass.toLowerCase()));
          
          if (hasMatch) {
            return true;
          }
        }
        return roles.includes(registeredAs.toLowerCase()) || roles.includes('all');
      });
    }

    const announcementsWithBase64 = announcements.map(a => {
      const images = (a.images || []).map(img => {
        if (!img || !img.data) return null;
        if (img.contentType === 'application/pdf') {
          return {
            url: `data:application/pdf;base64,${img.data.toString('base64')}`,
            fileType: 'pdf'
          };
        }
        return {
          url: `data:${img.contentType};base64,${img.data.toString('base64')}`,
          fileType: 'image'
        };
      }).filter(Boolean);
      
      const isNew = req.user && req.user._id ? !viewedIds.includes(a._id.toString()) : false;
      
      return {
        _id: a._id,
        text: a.text,
        images,
        classes: a.classes,
        announcementFor: a.announcementFor,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        isNew: isNew
      };
    });
    res.json({ announcements: announcementsWithBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching announcements', error: err.message });
  }
};

// Update announcement (replace/add images as Buffer, update classes)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    // Handle announcementFor field
    let announcementFor = req.body['announcementFor[]'] || req.body.announcementFor;
    if (typeof announcementFor === "string") {
      announcementFor = [announcementFor];
    }
    
    // Accept classes[] as array or string (from form-data)
    let classes = req.body['classes[]'] || req.body.classes;
    if (typeof classes === "string") {
      classes = [classes];
    }
    // Normalize announcementFor for logic (lowercase)
    let announcementForArr = Array.isArray(announcementFor) ? announcementFor : [];
    const announcementForLower = announcementForArr.map(a => a && typeof a === 'string' ? a.trim().toLowerCase() : a);
    // For storage, capitalize first letter of each role
    const announcementForStored = announcementForLower.map(role => role.charAt(0).toUpperCase() + role.slice(1));
    if (announcementForLower.includes("student") && (!classes || classes.length === 0 || (classes.length === 1 && (!classes[0] || classes[0].trim() === "")))) {
      classes = ["ALL"];
    }
    if (Array.isArray(classes)) {
      classes = classes.map(c => c && typeof c === 'string' && c.trim().toLowerCase() === 'all' ? 'ALL' : c);
    }
    
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    if (typeof text === 'string') announcement.text = text;
    
    // Update announcementFor if provided
    if (announcementForStored && Array.isArray(announcementForStored) && announcementForStored.length > 0) {
      announcement.announcementFor = announcementForStored;
    }
    
    // Update classes if provided
    if (classes && Array.isArray(classes) && classes.length > 0) {
      announcement.classes = classes;
    }
    
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: f.mimetype === 'application/pdf' ? 'pdf' : 'image'
      }));
      announcement.images = [...(announcement.images || []), ...newImages];
    }
    
    // Handle removed images
    if (req.body.removeImages) {
      const removeIndices = Array.isArray(req.body.removeImages) 
        ? req.body.removeImages.map(idx => parseInt(idx))
        : [parseInt(req.body.removeImages)];
      
      // Remove images at specified indices (in reverse order to maintain indices)
      removeIndices.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < announcement.images.length) {
          announcement.images.splice(idx, 1);
        }
      });
    }
    
    announcement.updatedAt = Date.now();
    await announcement.save();
    
    // Delete all AnnouncementView records for this announcement (force all users to see as EDITED)
    await AnnouncementView.deleteMany({ announcementId: announcement._id });

    // Convert images to base64 for response
    const images = (announcement.images || []).map(img =>
      img && img.data
        ? {
            url: img.contentType === 'application/pdf'
              ? `data:application/pdf;base64,${img.data.toString('base64')}`
              : `data:${img.contentType};base64,${img.data.toString('base64')}`,
            fileType: img.fileType || (img.contentType === 'application/pdf' ? 'pdf' : 'image')
          }
        : null
    ).filter(Boolean);
    
    res.json({
      message: 'Announcement updated',
      announcement: {
        _id: announcement._id,
        text: announcement.text,
        images,
        classes: announcement.classes,
        announcementFor: announcement.announcementFor,
        createdBy: announcement.createdBy,
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating announcement', error: err.message });
  }
};

// Delete announcement (no disk files to remove)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await Announcement.findByIdAndDelete(id);
    // Delete all AnnouncementView records for this announcement
    await AnnouncementView.deleteMany({ announcementId: id });
    res.json({ message: 'Announcement deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting announcement', error: err.message });
  }
};

// Remove a specific image from an announcement by index
export const removeAnnouncementImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageIndex } = req.body;
    if (typeof imageIndex !== 'number') {
      return res.status(400).json({ message: 'imageIndex (number) is required in body' });
    }
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    if (!Array.isArray(announcement.images) || imageIndex < 0 || imageIndex >= announcement.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }
    announcement.images.splice(imageIndex, 1);
    announcement.updatedAt = Date.now();
    await announcement.save();
    res.json({ message: 'Image removed from announcement', announcement });
  } catch (err) {
    res.status(500).json({ message: 'Error removing image', error: err.message });
  }
};

// Mark an announcement as viewed
export const markAnnouncementAsViewed = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    
    // Determine user type based on the user's role or model
    let userType = 'User'; // default
    if (req.user && req.user.isAdmin) {
      userType = 'Admin';
    } else if (req.user && req.user.role) {
      // Use the role from the user object (Student, Teacher, Guardian)
      // Ensure proper capitalization to match AnnouncementView schema
      const role = req.user.role.toLowerCase();
      if (role === 'student') userType = 'Student';
      else if (role === 'teacher') userType = 'Teacher';
      else if (role === 'guardian') userType = 'Guardian';
      else if (role === 'admin') userType = 'Admin';
      else userType = 'User';
    }
    
    const announcementId = req.params.announcementId;
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!announcementId) return res.status(400).json({ message: 'Announcement ID required' });
    
    const result = await AnnouncementView.updateOne(
      { userId, userType, announcementId },
      { $set: { viewedAt: new Date() } },
      { upsert: true }
    );
    
    res.json({ message: 'Announcement marked as viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking as viewed', error: err.message });
  }
};