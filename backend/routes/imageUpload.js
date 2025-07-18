import express from 'express';
const router = express.Router();
import upload from '../utils/multerS3.js';

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.location });
});

export default router; 