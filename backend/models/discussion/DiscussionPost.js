const mongoose = require('mongoose');

const DiscussionPostSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionThread', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost', default: null }, // null if root answer
  body: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost' }], // nested replies
}, { timestamps: true });

module.exports = mongoose.model('DiscussionPost', DiscussionPostSchema); 