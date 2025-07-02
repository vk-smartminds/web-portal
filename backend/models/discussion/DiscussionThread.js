const mongoose = require('mongoose');

const DiscussionThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionTag' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost' }], // root answers
}, { timestamps: true });

module.exports = mongoose.model('DiscussionThread', DiscussionThreadSchema); 