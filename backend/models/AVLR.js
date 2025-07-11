import mongoose from 'mongoose';

const avlrSchema = new mongoose.Schema({
  class: { type: String, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  link: { type: String, required: true }
});

avlrSchema.index({ class: 1 });
avlrSchema.index({ subject: 1 });
avlrSchema.index({ chapter: 1 });
avlrSchema.index({ class: 1, subject: 1, chapter: 1 });

const AVLR = mongoose.model('AVLR', avlrSchema);
export default AVLR; 