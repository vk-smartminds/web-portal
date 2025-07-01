const mongoose = require('mongoose');

const DiscussionNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['reply_on_post', 'reply_on_comment'], required: true },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionThread', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost', required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('DiscussionNotification', DiscussionNotificationSchema); 