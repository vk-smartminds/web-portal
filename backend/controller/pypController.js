import Pyp from '../models/Pyp.js';
import multer from 'multer';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const storage = multer.memoryStorage();
export const pypUpload = multer({
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

export const createPyp = async (req, res) => {
  try {
    const { class: pypClass, subject, pdfType } = req.body;
    if (!pypClass || !subject || !pdfType) {
      return res.status(400).json({ message: 'Class, subject, and pdfType are required' });
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
    const pyp = await Pyp.create({ class: pypClass, subject, pdfType, pdfs });
    res.status(201).json({ message: 'PYP created', pyp });
  } catch (err) {
    res.status(500).json({ message: 'Error creating PYP', error: err.message });
  }
};

export const getPyps = async (req, res) => {
  try {
    const { class: pypClass, subject, pdfType } = req.query;
    let query = {};
    if (pypClass) query.class = pypClass;
    if (subject) query.subject = subject;
    if (pdfType) query.pdfType = pdfType;
    const pyps = await Pyp.find(query).sort({ createdAt: -1 });
    const pypsWithBase64 = pyps.map(pyp => ({
      _id: pyp._id,
      class: pyp.class,
      subject: pyp.subject,
      pdfs: (pyp.pdfs || []).map(pdf => ({
        url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
        fileType: 'pdf'
      })),
      createdAt: pyp.createdAt,
      updatedAt: pyp.updatedAt
    }));
    res.json({ pyps: pypsWithBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching PYPs', error: err.message });
  }
};

export const updatePyp = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: pypClass, subject, pdfType } = req.body;
    const pyp = await Pyp.findById(id);
    if (!pyp) return res.status(404).json({ message: 'PYP not found' });
    if (pypClass) pyp.class = pypClass;
    if (subject) pyp.subject = subject;
    if (pdfType) pyp.pdfType = pdfType;
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
      pyp.pdfs = [...(pyp.pdfs || []), ...newPdfs];
    }
    if (req.body.removePdfs) {
      const removeIndices = Array.isArray(req.body.removePdfs)
        ? req.body.removePdfs.map(idx => parseInt(idx))
        : [parseInt(req.body.removePdfs)];
      removeIndices.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < pyp.pdfs.length) {
          pyp.pdfs.splice(idx, 1);
        }
      });
    }
    pyp.updatedAt = Date.now();
    await pyp.save();
    const pdfs = (pyp.pdfs || []).map(pdf => ({
      url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
      fileType: 'pdf'
    }));
    res.json({ message: 'PYP updated', pyp: { _id: pyp._id, class: pyp.class, subject: pyp.subject, pdfs, createdAt: pyp.createdAt, updatedAt: pyp.updatedAt } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating PYP', error: err.message });
  }
};

export const deletePyp = async (req, res) => {
  try {
    const { id } = req.params;
    const pyp = await Pyp.findById(id);
    if (!pyp) return res.status(404).json({ message: 'PYP not found' });
    await Pyp.findByIdAndDelete(id);
    res.json({ message: 'PYP deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting PYP', error: err.message });
  }
};

export const getPypPdf = async (req, res) => {
  try {
    const { id, pdfIndex } = req.params;
    const pyp = await Pyp.findById(id);
    if (!pyp || !pyp.pdfs || !pyp.pdfs[pdfIndex]) {
      return res.status(404).send('PDF not found');
    }
    const pdf = pyp.pdfs[pdfIndex];
    res.set('Content-Type', pdf.contentType);
    res.send(pdf.data);
  } catch (err) {
    res.status(500).send('Error retrieving PDF');
  }
}; 