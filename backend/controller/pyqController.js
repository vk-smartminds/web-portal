import Pyq from '../models/Pyq.js';
import multer from 'multer';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const storage = multer.memoryStorage();
export const pyqUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF files allowed'));
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

export const createPyq = async (req, res) => {
  try {
    const { class: pyqClass, subject, chapter, pdfType } = req.body;
    if (!pyqClass || !subject || !chapter || !pdfType) {
      return res.status(400).json({ message: 'Class, subject, chapter, and pdfType are required' });
    }
    let pdfs = [];
    if (req.files && req.files.length > 0) {
      pdfs = await Promise.all(req.files.map(async (f) => {
        if (f.mimetype === 'application/pdf') {
          const compressedPdf = await compressPdfBuffer(f.buffer);
          return {
            data: compressedPdf,
            contentType: f.mimetype,
            fileType: 'pdf'
          };
        }
      }));
    } else {
      return res.status(400).json({ message: 'At least one PDF is required' });
    }
    const pyq = await Pyq.create({ class: pyqClass, subject, chapter, pdfType, pdfs });
    res.status(201).json({ message: 'PYQ created', pyq });
  } catch (err) {
    res.status(500).json({ message: 'Error creating PYQ', error: err.message });
  }
};

export const getPyqs = async (req, res) => {
  try {
    const { class: pyqClass, subject, chapter, pdfType } = req.query;
    let query = {};
    if (pyqClass) query.class = pyqClass;
    if (subject) query.subject = subject;
    if (chapter) query.chapter = chapter;
    if (pdfType) query.pdfType = pdfType;
    const pyqs = await Pyq.find(query).sort({ createdAt: -1 });
    const pyqsWithBase64 = pyqs.map(pyq => ({
      _id: pyq._id,
      class: pyq.class,
      subject: pyq.subject,
      chapter: pyq.chapter,
      pdfType: pyq.pdfType,
      pdfs: (pyq.pdfs || []).map(pdf => ({
        url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
        fileType: 'pdf'
      })),
      createdAt: pyq.createdAt,
      updatedAt: pyq.updatedAt
    }));
    res.json({ pyqs: pyqsWithBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching PYQs', error: err.message });
  }
};

export const updatePyq = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: pyqClass, subject, chapter, pdfType } = req.body;
    const pyq = await Pyq.findById(id);
    if (!pyq) return res.status(404).json({ message: 'PYQ not found' });
    if (pyqClass) pyq.class = pyqClass;
    if (subject) pyq.subject = subject;
    if (chapter) pyq.chapter = chapter;
    if (pdfType) pyq.pdfType = pdfType;
    if (req.files && req.files.length > 0) {
      const newPdfs = await Promise.all(req.files.map(async (f) => {
        if (f.mimetype === 'application/pdf') {
          const compressedPdf = await compressPdfBuffer(f.buffer);
          return {
            data: compressedPdf,
            contentType: f.mimetype,
            fileType: 'pdf'
          };
        }
      }));
      pyq.pdfs = [...(pyq.pdfs || []), ...newPdfs];
    }
    if (req.body.removePdfs) {
      const removeIndices = Array.isArray(req.body.removePdfs)
        ? req.body.removePdfs.map(idx => parseInt(idx))
        : [parseInt(req.body.removePdfs)];
      removeIndices.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < pyq.pdfs.length) {
          pyq.pdfs.splice(idx, 1);
        }
      });
    }
    pyq.updatedAt = Date.now();
    await pyq.save();
    const pdfs = (pyq.pdfs || []).map(pdf => ({
      url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
      fileType: 'pdf'
    }));
    res.json({ message: 'PYQ updated', pyq: { _id: pyq._id, class: pyq.class, subject: pyq.subject, chapter: pyq.chapter, pdfs, createdAt: pyq.createdAt, updatedAt: pyq.updatedAt } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating PYQ', error: err.message });
  }
};

export const deletePyq = async (req, res) => {
  try {
    const { id } = req.params;
    const pyq = await Pyq.findById(id);
    if (!pyq) return res.status(404).json({ message: 'PYQ not found' });
    await Pyq.findByIdAndDelete(id);
    res.json({ message: 'PYQ deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting PYQ', error: err.message });
  }
};

export const getPyqPdf = async (req, res) => {
  try {
    const { id, pdfIndex } = req.params;
    const pyq = await Pyq.findById(id);
    if (!pyq || !pyq.pdfs || !pyq.pdfs[pdfIndex]) {
      return res.status(404).send('PDF not found');
    }
    const pdf = pyq.pdfs[pdfIndex];
    res.set('Content-Type', pdf.contentType);
    res.send(pdf.data);
  } catch (err) {
    res.status(500).send('Error retrieving PDF');
  }
}; 