import mongoose from 'mongoose';

const sqpSchema = new mongoose.Schema({
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

sqpSchema.index({ class: 1 });
sqpSchema.index({ subject: 1 });
sqpSchema.index({ chapter: 1 });
sqpSchema.index({ class: 1, subject: 1, chapter: 1 });

const Sqp = mongoose.model('Sqp', sqpSchema);
export default Sqp; 