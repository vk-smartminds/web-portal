import mongoose from 'mongoose';
const { Schema } = mongoose;

const questionSchema = new Schema({
  // class: 6-12, JEE, NEET, CUET (string for consistency, but only these values allowed)
  class: { type: String, required: true, enum: ['6','7','8','9','10','11','12','JEE','NEET','CUET'] },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  topics: [{ type: String }],
  type: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true }, // solution/explanation
  // For MCQ: single string (a/b/c/d). For select-all: array of strings (['a','c'])
  correct_option: { type: [String], required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  marks: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for fast querying
questionSchema.index({ class: 1, subject: 1, chapter: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
