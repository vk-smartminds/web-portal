import mongoose from 'mongoose';

const mindMapSchema = new mongoose.Schema({
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
  mindmap: [{
    data: Buffer,
    contentType: String
  }]
});

mindMapSchema.index({ class: 1, subject: 1, chapter: 1 });

const MindMap = mongoose.model('MindMap', mindMapSchema);
export default MindMap; 