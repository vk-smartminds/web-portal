import mongoose from 'mongoose';

const screenTimeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  userRole: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
  screenTime: { type: Number, default: 0 }, // in seconds
  lastActive: { type: Date, default: Date.now }, // optional, for advanced tracking
});

const ScreenTime = mongoose.model('ScreenTime', screenTimeSchema);
export default ScreenTime; 