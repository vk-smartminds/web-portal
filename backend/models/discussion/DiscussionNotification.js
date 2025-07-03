import mongoose from 'mongoose';

const DiscussionNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  userModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
  type: { type: String, enum: ['reply', 'comment', 'vote'], required: true },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionThread', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost', required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

DiscussionNotificationSchema.index({ user: 1, userModel: 1, createdAt: -1 });

export default mongoose.model('DiscussionNotification', DiscussionNotificationSchema); 