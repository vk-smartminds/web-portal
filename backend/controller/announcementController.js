import Announcement from '../models/Announcement.js';
import Admin from '../models/Admin.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer config for memory storage (buffer)
const storage = multer.memoryStorage();
export const announcementUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
  fileFilter: (req, file, cb) => {
    // Accept jpg/jpeg/png images and pdfs
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only jpg, png images and pdf files allowed'));
    cb(null, true);
  }
});

// Create announcement (images and pdfs as Buffer)
export const createAnnouncement = async (req, res) => {
  try {
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

    // Log the query parameters
    console.log('Fetching announcements for:', { registeredAs, class: studentClass });

    // Filter by announcementFor
    if (registeredAs) {
      announcements = announcements.filter(a => {
        // Always include announcements for Parent
        if (Array.isArray(a.announcementFor) && a.announcementFor.includes("Parent")) return true;

        // If class param is present, also include Student announcements for that class
        if (
          studentClass &&
          Array.isArray(a.announcementFor) && a.announcementFor.includes("Student") &&
          Array.isArray(a.classes) && (a.classes.includes("ALL") || a.classes.includes(studentClass))
        ) {
          return true;
        }

        // Fallback to original logic
        return Array.isArray(a.announcementFor) && (a.announcementFor.includes(registeredAs) || a.announcementFor.includes("All"));
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
      return {
        _id: a._id,
        text: a.text,
        images,
        classes: a.classes,
        announcementFor: a.announcementFor,
        createdBy: a.createdBy,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
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