import mongoose from 'mongoose';

const DiscussionVoteSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionPost', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  userModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
  value: { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });

DiscussionVoteSchema.index({ post: 1, user: 1, userModel: 1 }, { unique: true }); // one vote per user per post

export default mongoose.model('DiscussionVote', DiscussionVoteSchema); 