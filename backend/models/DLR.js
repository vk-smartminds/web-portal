import mongoose from 'mongoose';

const DLRSchema = new mongoose.Schema({
  class: { type: String, required: true, index: true },
  subject: { type: String, required: true, index: true },
  chapter: { type: String, required: true, index: true },
  pdfs: [
    {
      data: Buffer,
      contentType: String,
      fileType: { type: String, default: 'pdf' }
    }
  ]
});

DLRSchema.index({ class: 1, subject: 1, chapter: 1 });

export default mongoose.model('DLR', DLRSchema); 