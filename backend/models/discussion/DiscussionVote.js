const mongoose = require('mongoose');

const DiscussionVoteSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });

DiscussionVoteSchema.index({ post: 1, user: 1 }, { unique: true }); // one vote per user per post

module.exports = mongoose.model('DiscussionVote', DiscussionVoteSchema); 