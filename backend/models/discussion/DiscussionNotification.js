import mongoose from 'mongoose';

const discussionNotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  type: { type: String, required: true, enum: ['NEW_COMMENT', 'REPLY', 'POST_LIKED', 'COMMENT_LIKED'] },
  threadId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'DiscussionThread' },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  message: { type: String, required: true }
});

const DiscussionNotification = mongoose.model('DiscussionNotification', discussionNotificationSchema);

export default DiscussionNotification; 