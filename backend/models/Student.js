import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  school: {
    type: String,
    default:""
  },
  class: {
    type: String
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    default: ""
  },
  role: {
    type: String,
    default: 'Student'
  },
  guardian: [{
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian'],
      required: true
    }
  }],
  quizIds: [{
    type: String
  }],
  photo: {
    data: Buffer,
    contentType: String
  },
  profileVisibility: {
    name: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    phone: { type: Boolean, default: true },
    school: { type: Boolean, default: true },
    class: { type: Boolean, default: true },
    photo: { type: Boolean, default: true },
    guardian: { type: Boolean, default: true },
    role: { type: Boolean, default: true }
  },
  notificationSettings: {
    announcements: { type: Boolean, default: true },
    discussionReplies: { type: Boolean, default: true },
    assignmentDeadlines: { type: Boolean, default: false },
    newResources: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: false }
  }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
