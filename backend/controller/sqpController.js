import Sqp from '../models/Sqp.js';
import multer from 'multer';

const storage = multer.memoryStorage();
export const sqpUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF files allowed'));
    cb(null, true);
  }
});

export const createSqp = async (req, res) => {
  try {
    const { class: sqpClass, subject, chapter } = req.body;
    if (!sqpClass || !subject || !chapter) {
      return res.status(400).json({ message: 'Class, subject, and chapter are required' });
    }
    let pdfs = [];
    if (req.files && req.files.length > 0) {
      pdfs = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: 'pdf'
      }));
    } else {
      return res.status(400).json({ message: 'At least one PDF is required' });
    }
    const sqp = await Sqp.create({ class: sqpClass, subject, chapter, pdfs });
    res.status(201).json({ message: 'SQP created', sqp });
  } catch (err) {
    res.status(500).json({ message: 'Error creating SQP', error: err.message });
  }
};

export const getSqps = async (req, res) => {
  try {
    const { class: sqpClass, subject, chapter } = req.query;
    let query = {};
    if (sqpClass) query.class = sqpClass;
    if (subject) query.subject = subject;
    if (chapter) query.chapter = chapter;
    const sqps = await Sqp.find(query).sort({ createdAt: -1 });
    const sqpsWithBase64 = sqps.map(sqp => ({
      _id: sqp._id,
      class: sqp.class,
      subject: sqp.subject,
      chapter: sqp.chapter,
      pdfs: (sqp.pdfs || []).map(pdf => ({
        url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
        fileType: 'pdf'
      })),
      createdAt: sqp.createdAt,
      updatedAt: sqp.updatedAt
    }));
    res.json({ sqps: sqpsWithBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching SQPs', error: err.message });
  }
};

export const updateSqp = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: sqpClass, subject, chapter } = req.body;
    const sqp = await Sqp.findById(id);
    if (!sqp) return res.status(404).json({ message: 'SQP not found' });
    if (sqpClass) sqp.class = sqpClass;
    if (subject) sqp.subject = subject;
    if (chapter) sqp.chapter = chapter;
    if (req.files && req.files.length > 0) {
      const newPdfs = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: 'pdf'
      }));
      sqp.pdfs = [...(sqp.pdfs || []), ...newPdfs];
    }
    if (req.body.removePdfs) {
      const removeIndices = Array.isArray(req.body.removePdfs)
        ? req.body.removePdfs.map(idx => parseInt(idx))
        : [parseInt(req.body.removePdfs)];
      removeIndices.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < sqp.pdfs.length) {
          sqp.pdfs.splice(idx, 1);
        }
      });
    }
    sqp.updatedAt = Date.now();
    await sqp.save();
    const pdfs = (sqp.pdfs || []).map(pdf => ({
      url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
      fileType: 'pdf'
    }));
    res.json({ message: 'SQP updated', sqp: { _id: sqp._id, class: sqp.class, subject: sqp.subject, chapter: sqp.chapter, pdfs, createdAt: sqp.createdAt, updatedAt: sqp.updatedAt } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating SQP', error: err.message });
  }
};

export const deleteSqp = async (req, res) => {
  try {
    const { id } = req.params;
    const sqp = await Sqp.findById(id);
    if (!sqp) return res.status(404).json({ message: 'SQP not found' });
    await Sqp.findByIdAndDelete(id);
    res.json({ message: 'SQP deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting SQP', error: err.message });
  }
};

export const getSqpPdf = async (req, res) => {
  try {
    const { id, pdfIndex } = req.params;
    const sqp = await Sqp.findById(id);
    if (!sqp || !sqp.pdfs || !sqp.pdfs[pdfIndex]) {
      return res.status(404).send('PDF not found');
    }
    const pdf = sqp.pdfs[pdfIndex];
    res.set('Content-Type', pdf.contentType);
    res.send(pdf.data);
  } catch (err) {
    res.status(500).send('Error retrieving PDF');
  }
}; 