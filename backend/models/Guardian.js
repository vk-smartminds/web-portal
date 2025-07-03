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
