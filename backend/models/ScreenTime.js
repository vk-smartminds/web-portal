import mongoose from 'mongoose';

const dailyScreenTimeSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  screenTime: { type: Number, default: 0 }, // in seconds
  lastActive: { type: Date, default: null },
}, { _id: false });

const screenTimeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  userRole: { type: String, enum: ['Student', 'Teacher', 'Guardian', 'Admin'], required: true },
  days: [dailyScreenTimeSchema],
});

const ScreenTime = mongoose.model('ScreenTime', screenTimeSchema);
export default ScreenTime; 