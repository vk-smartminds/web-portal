import mongoose from 'mongoose';

const pypSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  pdfs: [{
    data: Buffer,
    contentType: String,
    fileType: { type: String, default: 'pdf' }
  }]
}, { timestamps: true });

pypSchema.index({ class: 1 });
pypSchema.index({ subject: 1 });
pypSchema.index({ class: 1, subject: 1 });

const Pyp = mongoose.model('Pyp', pypSchema);
export default Pyp; 