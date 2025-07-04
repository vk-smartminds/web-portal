const mongoose = require('mongoose');

const DiscussionTagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('DiscussionTag', DiscussionTagSchema); 