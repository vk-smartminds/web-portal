import mongoose from 'mongoose';

const creativeCornerSchema = new mongoose.Schema({
  class: { type: String, required: true, index: true },
  subject: { type: String, required: true, index: true },
  chapter: { type: String, required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['project', 'activity', 'poster', 'artwork', 'quiz', 'worksheet', 'poem', 'story', 'other']
  },
  title: { type: String, required: true },
  description: { type: String },
  files: [
    {
      data: Buffer,
      contentType: String,
      fileType: { type: String }, // 'pdf', 'image', etc.
      originalName: String
    }
  ],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

creativeCornerSchema.index({ class: 1, subject: 1, chapter: 1 });

export default mongoose.model('CreativeCorner', creativeCornerSchema); 