import mongoose from 'mongoose';

const DiscussionPostSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionThread', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost', default: null }, // null if root answer
  body: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost' }], // nested replies
}, { timestamps: true });

export default mongoose.model('DiscussionPost', DiscussionPostSchema); 