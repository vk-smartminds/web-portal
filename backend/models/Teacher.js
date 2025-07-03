import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    default: ""
  },
  role: {
    type: String,
    default: 'Teacher'
  },
  photo: {
    data: Buffer,
    contentType: String
  }
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
