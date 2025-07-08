// Get all available subjects for a given class (for student quiz selection)

import express from 'express';
const router = express.Router();
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { CHAPTER_WEIGHTAGE } from '../utils/chapterWeightage.js';

// Subjects and chapters endpoints removed: now handled by frontend content.js only
// ...existing code..


// Student: Get past quizzes
router.get('/my-quizzes/:studentId', async (req, res) => {
  try {
    // If studentId is not a valid ObjectId, return empty array
    if (!req.params.studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json([]);
    }
    const quizzes = await Quiz.find({ studentId: req.params.studentId }).populate('questions');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student: Create a quiz attempt (fetch questions, create quiz doc)
router.post('/attempt', async (req, res) => {
  try {
    const { class: className, subjects, chapters, topics, types, time, studentId } = req.body;
    // Find questions matching filters
    const filter = { class: className };
    if (subjects && subjects.length) filter.subject = { $in: subjects };
    if (chapters && chapters.length) filter.chapter = { $in: chapters };
    if (topics && topics.length) filter.topics = { $in: topics };
    if (types && types.length) filter.type = { $in: types };
    // Estimate number of questions by time (e.g., 1 question per 3 min)
    const numQuestions = Math.max(1, Math.floor(time / 3));

    // --- Weightage-based chapter selection (class 7 Mathematics only) ---
    if (className === '7' && subjects && subjects.length === 1 && subjects[0] === 'Mathematics') {
      const allQuestions = await Question.find(filter).lean();
      if (!allQuestions.length) {
        return res.status(400).json({ error: 'No questions available for the selected filters.' });
      }
      const chapterWeightage = CHAPTER_WEIGHTAGE['7']['Mathematics'];
      // Only consider selected chapters
      const selectedChapters = chapters.filter(ch => chapterWeightage[ch]);
      const totalWeight = selectedChapters.reduce((sum, ch) => sum + (chapterWeightage[ch] || 0), 0);
      // 1. Calculate expected questions per chapter
      const expected = selectedChapters.map(ch => ({
        chapter: ch,
        weight: chapterWeightage[ch],
        expected: (chapterWeightage[ch] / totalWeight) * numQuestions
      }));
      // 2. Assign integer part
      const assigned = expected.map(e => ({
        chapter: e.chapter,
        count: Math.floor(e.expected),
        fraction: e.expected - Math.floor(e.expected)
      }));
      let assignedTotal = assigned.reduce((sum, a) => sum + a.count, 0);
      let remainder = numQuestions - assignedTotal;
      // 3. Distribute remainder using weighted random by fraction
      const fractions = assigned.map(a => a.fraction);
      const chaptersForRemainder = assigned.map(a => a.chapter);
      while (remainder > 0) {
        // Weighted random selection
        const totalFrac = fractions.reduce((sum, f) => sum + f, 0);
        if (totalFrac === 0) break;
        let r = Math.random() * totalFrac;
        let idx = 0;
        while (r > 0 && idx < fractions.length) {
          r -= fractions[idx];
          if (r <= 0) break;
          idx++;
        }
        if (idx < assigned.length) {
          assigned[idx].count++;
          remainder--;
          fractions[idx] = 0; // Prevent double assignment
        } else {
          break;
        }
      }
      // 4. Select questions per chapter
      let selectedQuestions = [];
      const questionsByChapter = {};
      for (const ch of selectedChapters) {
        questionsByChapter[ch] = allQuestions.filter(q => q.chapter === ch);
      }
      for (const a of assigned) {
        const pool = [...questionsByChapter[a.chapter]];
        // Shuffle pool
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        selectedQuestions.push(...pool.slice(0, a.count));
      }
      // 5. If not enough questions, fill from remaining pool
      if (selectedQuestions.length < numQuestions) {
        const already = new Set(selectedQuestions.map(q => q._id.toString()));
        const remaining = allQuestions.filter(q => !already.has(q._id.toString()));
        // Shuffle remaining
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        selectedQuestions.push(...remaining.slice(0, numQuestions - selectedQuestions.length));
      }
      selectedQuestions = selectedQuestions.slice(0, numQuestions);
      // Extract actual subjects and chapters from selected questions
      const actualSubjects = [...new Set(selectedQuestions.map(q => q.subject))];
      const chaptersBySubject = {};
      for (const subj of actualSubjects) {
        const chaps = selectedQuestions.filter(q => q.subject === subj).map(q => q.chapter);
        chaptersBySubject[subj] = [...new Set(chaps)].sort((a, b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b);
        });
      }
      const quiz = new Quiz({
        class: className,
        subjects: actualSubjects,
        chapters: [].concat(...Object.values(chaptersBySubject)),
        chaptersBySubject,
        topics,
        types,
        questions: selectedQuestions.map(q => q._id || q._id),
        time,
        maxScore: selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
        studentId,
        status: 'in-progress',
        startedAt: new Date(),
      });
      await quiz.save();
      return res.status(201).json({ quizId: quiz._id, questions: selectedQuestions, subjects: actualSubjects, chaptersBySubject });
    }
    // --- END Weightage-based chapter selection ---

    // --- Fallback: old logic for other cases ---
    // 1. Group all matching questions by chapter
    const allQuestions = await Question.find(filter).lean();
    if (!allQuestions.length) {
      return res.status(400).json({ error: 'No questions available for the selected filters.' });
    }
    const chaptersSet = new Set(chapters);
    const questionsByChapter = {};
    for (const ch of chaptersSet) {
      questionsByChapter[ch] = allQuestions.filter(q => q.chapter === ch);
    }
    // 2. Calculate per-chapter distribution
    const chapterList = Array.from(chaptersSet);
    const N = chapterList.length;
    const perChapter = Math.floor(numQuestions / N);
    let remainder = numQuestions % N;
    let selectedQuestions = [];
    // 3. For each chapter, randomly select perChapter questions
    for (const ch of chapterList) {
      const pool = [...questionsByChapter[ch]];
      // Shuffle pool
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      selectedQuestions.push(...pool.slice(0, perChapter));
    }
    // 4. Distribute remainder: pick one more from random chapters
    let remainderChapters = chapterList.slice();
    while (remainder > 0 && remainderChapters.length > 0) {
      const idx = Math.floor(Math.random() * remainderChapters.length);
      const ch = remainderChapters[idx];
      const pool = questionsByChapter[ch].filter(q => !selectedQuestions.some(sel => sel._id.toString() === q._id.toString()));
      if (pool.length > 0) {
        // Shuffle pool
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        selectedQuestions.push(pool[0]);
        remainder--;
      }
      remainderChapters.splice(idx, 1);
    }
    // 5. If not enough questions (some chapters have too few), fill from remaining pool
    if (selectedQuestions.length < numQuestions) {
      const already = new Set(selectedQuestions.map(q => q._id.toString()));
      const remaining = allQuestions.filter(q => !already.has(q._id.toString()));
      // Shuffle remaining
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      selectedQuestions.push(...remaining.slice(0, numQuestions - selectedQuestions.length));
    }
    // 6. Truncate to numQuestions if over
    selectedQuestions = selectedQuestions.slice(0, numQuestions);
    // --- END Balanced chapter selection ---

    // Extract actual subjects and chapters from selected questions
    const actualSubjects = [...new Set(selectedQuestions.map(q => q.subject))];
    // Group chapters by subject
    const chaptersBySubject = {};
    for (const subj of actualSubjects) {
      const chaps = selectedQuestions.filter(q => q.subject === subj).map(q => q.chapter);
      chaptersBySubject[subj] = [...new Set(chaps)].sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      });
    }
    // Create quiz doc
    const quiz = new Quiz({
      class: className,
      subjects: actualSubjects,
      chapters: [].concat(...Object.values(chaptersBySubject)),
      chaptersBySubject,
      topics,
      types,
      questions: selectedQuestions.map(q => q._id || q._id),
      time,
      maxScore: selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
      studentId,
      status: 'in-progress',
      startedAt: new Date(),
    });
    await quiz.save();
    res.status(201).json({ quizId: quiz._id, questions: selectedQuestions, subjects: actualSubjects, chaptersBySubject });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Student: Submit quiz responses
router.post('/submit/:quizId', async (req, res) => {
  try {
    const { responses } = req.body;
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    // Calculate results
    let correct = 0, incorrect = 0, unattempted = 0;
    quiz.responses = responses;
    quiz.endedAt = new Date();
    quiz.status = 'completed';
    quiz.questions.forEach((q, idx) => {
      const resp = responses.find(r => r.question == q._id.toString());
      if (!resp || resp.selectedOption === undefined || resp.selectedOption === null || (Array.isArray(resp.selectedOption) && resp.selectedOption.length === 0)) {
        unattempted++;
      } else {
        // Normalize correct_option and selectedOption to arrays
        const correctOpt = Array.isArray(q.correct_option) ? q.correct_option : [q.correct_option];
        const selectedOpt = Array.isArray(resp.selectedOption) ? resp.selectedOption : [resp.selectedOption];
        // Compare arrays (order-insensitive)
        const isCorrect = correctOpt.length === selectedOpt.length &&
          correctOpt.every(opt => selectedOpt.includes(opt)) &&
          selectedOpt.every(opt => correctOpt.includes(opt));
        if (isCorrect) correct++;
        else incorrect++;
      }
    });
    quiz.correct = correct;
    quiz.incorrect = incorrect;
    quiz.unattempted = unattempted;
    await quiz.save();
    res.json({ correct, incorrect, unattempted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Student: Get quiz report
router.get('/report/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
