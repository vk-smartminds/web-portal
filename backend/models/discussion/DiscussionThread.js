import mongoose from 'mongoose';

const DiscussionThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  tags: [{ type: String, enum: ['CBSE', 'Maths', 'Science', 'JEE', 'NEET'] }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
  images: [{
    data: Buffer,
    contentType: String,
    fileType: String // 'image' or 'pdf' (future-proof)
  }],
  posts: [{
    body: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdByModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
    parentPost: { type: mongoose.Schema.Types.ObjectId, default: null }, // for nested replies
    votes: [{
      user: { type: mongoose.Schema.Types.ObjectId, required: true },
      userModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
      value: { type: Number, enum: [1, -1], required: true }
    }],
    images: [{
      data: Buffer,
      contentType: String,
      fileType: String // 'image' or 'pdf' (future-proof)
    }],
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
  }],
  votes: [{
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    userModel: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
    value: { type: Number, enum: [1, -1], required: true }
  }]
}, { timestamps: true });

export default mongoose.model('DiscussionThread', DiscussionThreadSchema); 