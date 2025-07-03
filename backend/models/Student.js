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
  guardianIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guardian'
  }],
  quizIds: [{
    type: String
  }],
  photo: {
    data: Buffer,
    contentType: String
  }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
