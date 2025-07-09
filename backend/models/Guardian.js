import mongoose from 'mongoose';

const guardianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  alternativeEmail: {
    type: String,
    default: ""
  },
  username:{
    type: String,
    default: ""
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    default: ""
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  profileVisibility: {
    name: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    phone: { type: Boolean, default: true },
    child: { type: Boolean, default: true },
    photo: { type: Boolean, default: true },
    role: { type: Boolean, default: true }
  },
  notificationSettings: {
    announcements: { type: Boolean, default: true },
    discussionReplies: { type: Boolean, default: true },
    assignmentDeadlines: { type: Boolean, default: false },
    newResources: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: false }
  },
  userRole: {
    type: String,
    default: 'Guardian'
  },
  child: [{
    email: String,
    class: String,
    role: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian'],
      required: true
    }
  }],
});

const Guardian = mongoose.model('Guardian', guardianSchema);

export default Guardian;
