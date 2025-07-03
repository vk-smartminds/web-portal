import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 2000 * 6 // 2000 words (approx 6 chars per word)
  },
  images: [{
    data: Buffer,
    contentType: String, // image/jpeg, image/png, application/pdf
    fileType: { type: String, default: "image" } // "image" or "pdf"
  }],
  classes: [{
    type: String, // e.g. "10", "11", "12"
    required: true
  }],
  createdBy: {
    type: String, // email or admin id
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  announcementFor: [{
    type: String, // "Student", "Teacher", "Guardian", "All"
    required: true
  }]
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;