import mongoose from 'mongoose';

const announcementViewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userType: {
    type: String,
    enum: ['Student', 'Teacher', 'Guardian', 'Admin', 'User'],
    required: true
  },
  announcementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only have one view record per announcement per userType
announcementViewSchema.index({ userId: 1, userType: 1, announcementId: 1 }, { unique: true });

const AnnouncementView = mongoose.model('AnnouncementView', announcementViewSchema);
export default AnnouncementView; 