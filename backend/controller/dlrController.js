import DLR from '../models/DLR.js';
import multer from 'multer';

const storage = multer.memoryStorage();
export const dlrUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF files allowed'));
    cb(null, true);
  }
});

export const createDLR = async (req, res) => {
  try {
    const { class: dlrClass, subject, chapter } = req.body;
    if (!dlrClass || !subject || !chapter) {
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
    const dlr = await DLR.create({ class: dlrClass, subject, chapter, pdfs });
    res.status(201).json({ message: 'DLR created', dlr });
  } catch (err) {
    res.status(500).json({ message: 'Error creating DLR', error: err.message });
  }
};

export const getDLRs = async (req, res) => {
  try {
    const { class: dlrClass, subject, chapter } = req.query;
    let query = {};
    if (dlrClass) query.class = dlrClass;
    if (subject) query.subject = subject;
    if (chapter) query.chapter = chapter;
    const dlrs = await DLR.find(query).sort({ createdAt: -1 });
    const dlrsWithBase64 = dlrs.map(dlr => ({
      _id: dlr._id,
      class: dlr.class,
      subject: dlr.subject,
      chapter: dlr.chapter,
      pdfs: (dlr.pdfs || []).map(pdf => ({
        url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
        fileType: 'pdf'
      })),
      createdAt: dlr.createdAt,
      updatedAt: dlr.updatedAt
    }));
    res.json({ dlrs: dlrsWithBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching DLRs', error: err.message });
  }
};

export const updateDLR = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: dlrClass, subject, chapter } = req.body;
    const dlr = await DLR.findById(id);
    if (!dlr) return res.status(404).json({ message: 'DLR not found' });
    if (dlrClass) dlr.class = dlrClass;
    if (subject) dlr.subject = subject;
    if (chapter) dlr.chapter = chapter;
    if (req.files && req.files.length > 0) {
      const newPdfs = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: 'pdf'
      }));
      dlr.pdfs = [...(dlr.pdfs || []), ...newPdfs];
    }
    if (req.body.removePdfs) {
      const removeIndices = Array.isArray(req.body.removePdfs)
        ? req.body.removePdfs.map(idx => parseInt(idx))
        : [parseInt(req.body.removePdfs)];
      removeIndices.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < dlr.pdfs.length) {
          dlr.pdfs.splice(idx, 1);
        }
      });
    }
    dlr.updatedAt = Date.now();
    await dlr.save();
    const pdfs = (dlr.pdfs || []).map(pdf => ({
      url: `data:application/pdf;base64,${pdf.data.toString('base64')}`,
      fileType: 'pdf'
    }));
    res.json({ message: 'DLR updated', dlr: { _id: dlr._id, class: dlr.class, subject: dlr.subject, chapter: dlr.chapter, pdfs, createdAt: dlr.createdAt, updatedAt: dlr.updatedAt } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating DLR', error: err.message });
  }
};

export const deleteDLR = async (req, res) => {
  try {
    const { id } = req.params;
    const dlr = await DLR.findById(id);
    if (!dlr) return res.status(404).json({ message: 'DLR not found' });
    await DLR.findByIdAndDelete(id);
    res.json({ message: 'DLR deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting DLR', error: err.message });
  }
};

export const removeDLRPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdfIndex } = req.body;
    if (typeof pdfIndex !== 'number') {
      return res.status(400).json({ message: 'pdfIndex (number) is required in body' });
    }
    const dlr = await DLR.findById(id);
    if (!dlr) return res.status(404).json({ message: 'DLR not found' });
    if (!Array.isArray(dlr.pdfs) || pdfIndex < 0 || pdfIndex >= dlr.pdfs.length) {
      return res.status(400).json({ message: 'Invalid PDF index' });
    }
    dlr.pdfs.splice(pdfIndex, 1);
    dlr.updatedAt = Date.now();
    await dlr.save();
    res.json({ message: 'PDF removed from DLR', dlr });
  } catch (err) {
    res.status(500).json({ message: 'Error removing PDF', error: err.message });
  }
}; 