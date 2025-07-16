import CreativeCorner from '../models/CreativeCorner.js';
import multer from 'multer';
import sharp from 'sharp';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const storage = multer.memoryStorage();
export const creativeCornerUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
  fileFilter: (req, file, cb) => {
    // Accept images and pdfs
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only jpg, png images and pdf files allowed'));
    cb(null, true);
  }
});

// Utility to compress PDF using Ghostscript
async function compressPdfBuffer(buffer) {
  const tmpIn = path.join(process.cwd(), 'tmp-in-' + Date.now() + '-' + Math.random() + '.pdf');
  const tmpOut = path.join(process.cwd(), 'tmp-out-' + Date.now() + '-' + Math.random() + '.pdf');
  try {
    await fs.writeFile(tmpIn, buffer);
    await new Promise((resolve, reject) => {
      execFile(
        'gswin64c',
        [
          '-sDEVICE=pdfwrite',
          '-dCompatibilityLevel=1.4',
          '-dPDFSETTINGS=/ebook',
          '-dNOPAUSE',
          '-dQUIET',
          '-dBATCH',
          `-sOutputFile=${tmpOut}`,
          tmpIn
        ],
        (error) => {
          if (error) reject(error); else resolve();
        }
      );
    });
    const outBuffer = await fs.readFile(tmpOut);
    return outBuffer;
  } finally {
    fs.unlink(tmpIn).catch(() => {});
    fs.unlink(tmpOut).catch(() => {});
  }
}

// Add Creative Item
export const addCreativeItem = async (req, res) => {
  try {
    const { class: className, subject, chapter, type, title, description } = req.body;
    if (!className || !subject || !chapter || !type || !title) {
      return res.status(400).json({ message: 'Class, subject, chapter, type, and title are required' });
    }
    // Use authenticated user's email for createdBy
    const createdBy = req.user?.email || req.body.createdBy || 'Unknown';
    const files = req.files && req.files.length > 0 ? await Promise.all(req.files.map(async (f) => {
      if (f.mimetype.startsWith('image/')) {
        const compressedBuffer = await sharp(f.buffer)
          .resize({ width: 1000 })
          .jpeg({ quality: 70 })
          .toBuffer();
        return {
          data: compressedBuffer,
          contentType: 'image/jpeg',
          fileType: 'image',
          originalName: f.originalname
        };
      } else if (f.mimetype === 'application/pdf') {
        const compressedPdf = await compressPdfBuffer(f.buffer);
        return {
          data: compressedPdf,
          contentType: f.mimetype,
          fileType: 'pdf',
          originalName: f.originalname
        };
      }
    })) : [];
    const item = await CreativeCorner.create({
      class: className,
      subject,
      chapter,
      type,
      title,
      description,
      files,
      createdBy,
      createdAt: new Date()
    });
    res.status(201).json({ message: 'Creative item added', creative: item });
  } catch (err) {
    res.status(500).json({ message: 'Error adding creative item', error: err.message });
  }
};

// Get Creative Items (with optional filters)
export const getCreativeItems = async (req, res) => {
  try {
    const { class: className, subject, chapter, type, createdBy } = req.query;
    const filter = {};
    if (className) filter.class = className.trim().toLowerCase();
    if (subject) filter.subject = subject.trim().toLowerCase();
    if (chapter) filter.chapter = chapter.trim().toLowerCase();
    if (type) filter.type = type;
    if (createdBy) filter.createdBy = createdBy;
    const items = await CreativeCorner.find(filter).sort({ createdAt: -1 });
    // Convert files to base64 for frontend preview
    const itemsWithFiles = items.map(item => ({
      ...item.toObject(),
      files: (item.files || []).map(f => ({
        url: f.fileType === 'pdf'
          ? `data:application/pdf;base64,${f.data.toString('base64')}`
          : `data:${f.contentType};base64,${f.data.toString('base64')}`,
        fileType: f.fileType,
        originalName: f.originalName
      }))
    }));
    res.json({ creativeItems: itemsWithFiles });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching creative items', error: err.message });
  }
};

// Delete Creative Item
export const deleteCreativeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CreativeCorner.findById(id);
    if (!item) return res.status(404).json({ message: 'Creative item not found' });
    await CreativeCorner.findByIdAndDelete(id);
    res.json({ message: 'Creative item deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting creative item', error: err.message });
  }
};

// Update Creative Item
export const updateCreativeItem = async (req, res) => {
  try {
    const { id } = req.params;
    let { class: className, subject, chapter, type, title, description, removeFiles } = req.body;
    if (!className || !subject || !chapter || !type || !title) {
      return res.status(400).json({ message: 'Class, subject, chapter, type, and title are required' });
    }
    if (typeof removeFiles === 'string') removeFiles = [removeFiles];
    if (!Array.isArray(removeFiles)) removeFiles = [];
    removeFiles = removeFiles.map(idx => parseInt(idx)).filter(idx => !isNaN(idx));
    const item = await CreativeCorner.findById(id);
    if (!item) return res.status(404).json({ message: 'Creative item not found' });
    item.class = className.trim().toLowerCase();
    item.subject = subject.trim().toLowerCase();
    item.chapter = chapter.trim().toLowerCase();
    item.type = type;
    item.title = title;
    item.description = description;
    // Remove files by index (reverse order)
    if (removeFiles.length > 0 && Array.isArray(item.files)) {
      removeFiles.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < item.files.length) {
          item.files.splice(idx, 1);
        }
      });
    }
    // Add new files
    if (req.files && req.files.length > 0) {
      const newFiles = await Promise.all(req.files.map(async (f) => {
        if (f.mimetype.startsWith('image/')) {
          const compressedBuffer = await sharp(f.buffer)
            .resize({ width: 1000 })
            .jpeg({ quality: 70 })
            .toBuffer();
          return {
            data: compressedBuffer,
            contentType: 'image/jpeg',
            fileType: 'image',
            originalName: f.originalname
          };
        } else if (f.mimetype === 'application/pdf') {
          const compressedPdf = await compressPdfBuffer(f.buffer);
          return {
            data: compressedPdf,
            contentType: f.mimetype,
            fileType: 'pdf',
            originalName: f.originalname
          };
        }
      }));
      item.files = [...(item.files || []), ...newFiles];
    }
    await item.save();
    // Prepare response with base64 files
    const files = (item.files || []).map(f => ({
      url: f.fileType === 'pdf'
        ? `data:application/pdf;base64,${f.data.toString('base64')}`
        : `data:${f.contentType};base64,${f.data.toString('base64')}`,
      fileType: f.fileType,
      originalName: f.originalName
    }));
    res.json({ message: 'Creative item updated', creative: { ...item.toObject(), files } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating creative item', error: err.message });
  }
};

// Stream a specific file (PDF or image) from Creative Corner
export const getCreativeCornerFile = async (req, res) => {
  try {
    const { id, fileIndex } = req.params;
    const item = await CreativeCorner.findById(id);
    if (!item || !item.files || !item.files[parseInt(fileIndex)]) {
      return res.status(404).json({ message: 'File not found' });
    }
    const file = item.files[parseInt(fileIndex)];
    if (!file || !file.data || !file.contentType) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `inline; filename="creative-corner-file.${file.contentType.split('/')[1] || 'bin'}"`);
    res.send(file.data);
  } catch (err) {
    res.status(500).json({ message: 'Error streaming file', error: err.message });
  }
}; 