import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true
  },
  pdfType: {
    type: String,
    enum: ['questions', 'solutions', 'both'],
    required: true
  },
  pdfs: [{
    data: Buffer,
    contentType: String,
    fileType: { type: String, default: 'pdf' }
  }]
}, { timestamps: true });

pyqSchema.index({ class: 1 });
pyqSchema.index({ subject: 1 });
pyqSchema.index({ chapter: 1 });
pyqSchema.index({ class: 1, subject: 1, chapter: 1 });

const Pyq = mongoose.model('Pyq', pyqSchema);
export default Pyq; 