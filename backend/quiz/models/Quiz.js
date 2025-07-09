import mongoose from 'mongoose';
const { Schema } = mongoose;

const quizSchema = new Schema({
  // class: 6-12, JEE, NEET, CUET (string for consistency, but only these values allowed)
  class: { type: String, required: true, enum: ['6','7','8','9','10','11','12','JEE','NEET','CUET'] },
  subjects: [{ type: String, required: false }],
  chapters: [{ type: String, required: false }],
  topics: [{ type: String }],
  types: [{ type: String, required: false }],
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
  time: { type: Number, required: true }, // in minutes
  maxScore: { type: Number },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  unattempted: { type: Number, default: 0 },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student' }, // for student quiz instance
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  responses: [{
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: [String], default: undefined },
    timeSpent: { type: Number, default: 0 }, // seconds
    markedForReview: { type: Boolean, default: false }
  }],
  startedAt: { type: Date },
  endedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  chaptersBySubject: { type: Object, default: {} }
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
