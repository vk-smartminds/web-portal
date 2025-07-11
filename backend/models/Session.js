import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
  sessionId: { type: String, required: true },
  login: {
    timestamp: { type: Date, required: true },
    ip: String,
    userAgent: String
  },
  logout: {
    timestamp: Date,
    ip: String,
    userAgent: String
  }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session; 