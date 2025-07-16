import MindMap from '../models/MindMap.js';
import multer from 'multer';
import sharp from 'sharp';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

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

const storage = multer.memoryStorage();
export const mindMapUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    // Accept jpg/jpeg/png images and pdfs
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only jpg, png images and pdf files allowed'));
    cb(null, true);
  }
});

// Add MindMap
export const addMindMap = async (req, res) => {
  try {
    const { class: className, subject, chapter } = req.body;
    if (!className || !subject || !chapter) {
      return res.status(400).json({ message: 'Class, subject, and chapter are required' });
    }
    // Store in lowercase
    const classLower = className.trim().toLowerCase();
    const subjectLower = subject.trim().toLowerCase();
    const chapterLower = chapter.trim().toLowerCase();
    let mindmap = [];
    if (req.files && req.files.length > 0) {
      mindmap = await Promise.all(req.files.map(async (f) => {
        if (f.mimetype.startsWith('image/')) {
          const compressedBuffer = await sharp(f.buffer)
            .resize({ width: 1000 })
            .jpeg({ quality: 70 })
            .toBuffer();
          return {
            data: compressedBuffer,
            contentType: 'image/jpeg'
          };
        } else if (f.mimetype === 'application/pdf') {
          const compressedPdf = await compressPdfBuffer(f.buffer);
          return {
            data: compressedPdf,
            contentType: f.mimetype
          };
        }
      }));
    }
    const mindMapDoc = await MindMap.create({
      class: classLower,
      subject: subjectLower,
      chapter: chapterLower,
      mindmap
    });
    res.status(201).json({ message: 'Mind map added', mindMap: mindMapDoc });
  } catch (err) {
    res.status(500).json({ message: 'Error adding mind map', error: err.message });
  }
};

// Get all MindMaps
export const getMindMaps = async (req, res) => {
  try {
    const { class: className, subject, chapter } = req.query;
    const filter = {};
    if (className) filter.class = className.trim().toLowerCase();
    if (subject) filter.subject = subject.trim().toLowerCase();
    if (chapter) filter.chapter = chapter.trim().toLowerCase();

    const mindMaps = await MindMap.find(filter).sort({ createdAt: -1 });
    const mindMapsWithBase64 = mindMaps.map(m => ({
      _id: m._id,
      class: m.class,
      subject: m.subject,
      chapter: m.chapter,
      mindmap: (m.mindmap || []).map(img => img && img.data ? {
        url: img.contentType === 'application/pdf'
          ? `data:application/pdf;base64,${img.data.toString('base64')}`
          : `data:${img.contentType};base64,${img.data.toString('base64')}`,
        fileType: img.contentType === 'application/pdf' ? 'pdf' : 'image'
      } : null).filter(Boolean),
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));
    res.json({ mindMaps: mindMapsWithBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching mind maps', error: err.message });
  }
};

// Delete MindMap
export const deleteMindMap = async (req, res) => {
  try {
    const { id } = req.params;
    const mindMap = await MindMap.findById(id);
    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }
    await MindMap.findByIdAndDelete(id);
    res.json({ message: 'Mind map deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting mind map', error: err.message });
  }
};

// Update MindMap (edit fields, add/remove images/pdfs)
export const updateMindMap = async (req, res) => {
  try {
    const { id } = req.params;
    let { class: className, subject, chapter } = req.body;
    // Accept removeImages as array of indices
    let removeImages = req.body.removeImages;
    if (typeof removeImages === 'string') removeImages = [removeImages];
    if (!Array.isArray(removeImages)) removeImages = [];
    removeImages = removeImages.map(idx => parseInt(idx)).filter(idx => !isNaN(idx));

    // Store fields in lowercase if provided
    if (className) className = className.trim().toLowerCase();
    if (subject) subject = subject.trim().toLowerCase();
    if (chapter) chapter = chapter.trim().toLowerCase();

    const mindMap = await MindMap.findById(id);
    if (!mindMap) return res.status(404).json({ message: 'Mind map not found' });

    if (className) mindMap.class = className;
    if (subject) mindMap.subject = subject;
    if (chapter) mindMap.chapter = chapter;

    // Remove images by index (in reverse order)
    if (removeImages.length > 0 && Array.isArray(mindMap.mindmap)) {
      removeImages.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < mindMap.mindmap.length) {
          mindMap.mindmap.splice(idx, 1);
        }
      });
    }

    // Add new images/pdfs
    if (req.files && req.files.length > 0) {
      const newFiles = await Promise.all(req.files.map(async (f) => {
        if (f.mimetype.startsWith('image/')) {
          const compressedBuffer = await sharp(f.buffer)
            .resize({ width: 1000 })
            .jpeg({ quality: 70 })
            .toBuffer();
          return {
            data: compressedBuffer,
            contentType: 'image/jpeg'
          };
        } else if (f.mimetype === 'application/pdf') {
          const compressedPdf = await compressPdfBuffer(f.buffer);
          return {
            data: compressedPdf,
            contentType: f.mimetype
          };
        }
      }));
      mindMap.mindmap = [...(mindMap.mindmap || []), ...newFiles];
    }

    await mindMap.save();

    // Prepare response with base64 images/pdfs
    const mindmap = (mindMap.mindmap || []).map(img => img && img.data ? {
      url: img.contentType === 'application/pdf'
        ? `data:application/pdf;base64,${img.data.toString('base64')}`
        : `data:${img.contentType};base64,${img.data.toString('base64')}`,
      fileType: img.contentType === 'application/pdf' ? 'pdf' : 'image'
    } : null).filter(Boolean);

    res.json({
      message: 'Mind map updated',
      mindMap: {
        _id: mindMap._id,
        class: mindMap.class,
        subject: mindMap.subject,
        chapter: mindMap.chapter,
        mindmap
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating mind map', error: err.message });
  }
};

// Stream a specific PDF from a MindMap
export const getMindMapPdf = async (req, res) => {
  try {
    const { id, pdfIndex } = req.params;
    const mindMap = await MindMap.findById(id);
    if (!mindMap || !mindMap.mindmap || !mindMap.mindmap[parseInt(pdfIndex)]) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    const file = mindMap.mindmap[parseInt(pdfIndex)];
    if (!file || file.contentType !== 'application/pdf') {
      return res.status(404).json({ message: 'PDF not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="mindmap.pdf"');
    res.send(file.data);
  } catch (err) {
    res.status(500).json({ message: 'Error streaming PDF', error: err.message });
  }
}; 