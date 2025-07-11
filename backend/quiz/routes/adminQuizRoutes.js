import express from 'express';
const router = express.Router();
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

// Create a new question
router.post('/question', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.type && data.category) {
      data.type = data.category;
    }
    delete data.category;
    if (!Array.isArray(data.options) || data.options.length !== 4) {
      return res.status(400).json({ error: 'Exactly 4 options (a/b/c/d) are required.' });
    }
    // Accept correct_option as string, array, or comma-separated string
    let correctOpt = data.correct_option;
    if (typeof correctOpt === 'string') {
      // If comma separated, split into array
      if (correctOpt.includes(',')) {
        correctOpt = correctOpt.split(',').map(opt => opt.trim());
      } else {
        correctOpt = [correctOpt.trim()];
      }
    } else if (Array.isArray(correctOpt)) {
      correctOpt = correctOpt.map(opt => (typeof opt === 'string' ? opt.trim() : opt));
    } else {
      return res.status(400).json({ error: 'correct_option must be a string or array of strings' });
    }
    // Normalize: convert index or value to a/b/c/d
    correctOpt = correctOpt.map(opt => {
      if (/^[0-3]$/.test(opt)) {
        return String.fromCharCode(97 + parseInt(opt));
      }
      const idx = data.options.findIndex(o => o.trim() === opt);
      if (idx !== -1) return String.fromCharCode(97 + idx);
      if (['a', 'b', 'c', 'd'].includes(opt)) return opt;
      throw new Error('correct_option must be a, b, c, or d');
    });
    // Remove duplicates
    correctOpt = [...new Set(correctOpt)];
    data.correct_option = correctOpt;
    const question = new Question(data);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all questions (with filters)
router.get('/questions', async (req, res) => {
  try {
    const { class: className, subject, chapter } = req.query;
    const filter = {};
    if (className) filter.class = className;
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a question
router.put('/question/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.type && data.category) {
      data.type = data.category;
    }
    delete data.category;
    if (!Array.isArray(data.options) || data.options.length !== 4) {
      return res.status(400).json({ error: 'Exactly 4 options (a/b/c/d) are required.' });
    }
    let correctOpt = data.correct_option;
    if (typeof correctOpt === 'string') {
      if (correctOpt.includes(',')) {
        correctOpt = correctOpt.split(',').map(opt => opt.trim());
      } else {
        correctOpt = [correctOpt.trim()];
      }
    } else if (Array.isArray(correctOpt)) {
      correctOpt = correctOpt.map(opt => (typeof opt === 'string' ? opt.trim() : opt));
    } else {
      return res.status(400).json({ error: 'correct_option must be a string or array of strings' });
    }
    correctOpt = correctOpt.map(opt => {
      if (/^[0-3]$/.test(opt)) {
        return String.fromCharCode(97 + parseInt(opt));
      }
      const idx = data.options.findIndex(o => o.trim() === opt);
      if (idx !== -1) return String.fromCharCode(97 + idx);
      if (['a', 'b', 'c', 'd'].includes(opt)) return opt;
      throw new Error('correct_option must be a, b, c, or d');
    });
    correctOpt = [...new Set(correctOpt)];
    data.correct_option = correctOpt;
    const updated = await Question.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a question
router.delete('/question/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all quizzes (admin view)
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('questions');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single quiz by ID (with questions)
router.get('/quiz/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a quiz (admin)
router.post('/quiz', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
