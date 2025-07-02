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
  guardianIds: {
    type: "array",
    default: ""
  },
  quizIds: {
    type: "array",
    default: ""
  },
  childClass: {
    type: String,
    // Only required for Parent, so not globally required
    default: ""
  },
  photo: {
    data: Buffer,
    contentType: String
  }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
