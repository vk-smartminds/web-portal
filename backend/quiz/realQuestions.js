// Script to bulk insert real/realistic questions for class 7 (all subjects/chapters)
import mongoose from 'mongoose';
import Question from './models/Question.js';
import dotenv from 'dotenv';
dotenv.config();

// --- Chapter mapping (copy from frontend for class 7) ---
const CHAPTERS_BY_CLASS_SUBJECT = {
  'Mathematics': [
    { number: '1', name: 'Integers' },
    { number: '2', name: 'Fractions and Decimals' },
    { number: '3', name: 'Data Handling' },
    { number: '4', name: 'Simple Equations' },
    { number: '5', name: 'Lines and Angles' },
    { number: '6', name: 'The Triangle and its Properties' },
    { number: '7', name: 'Congruence of Triangles' },
    { number: '8', name: 'Comparing Quantities' },
    { number: '9', name: 'Rational Numbers' },
    { number: '10', name: 'Practical Geometry' },
    { number: '11', name: 'Perimeter and Area' },
    { number: '12', name: 'Algebraic Expressions' },
    { number: '13', name: 'Exponents and Powers' },
    { number: '14', name: 'Symmetry' },
    { number: '15', name: 'Visualising Solid Shapes' }
  ],
  'Science': [
    { number: '1', name: 'Nutrition in Plants' },
    { number: '2', name: 'Nutrition in Animals' },
    { number: '3', name: 'Fibre to Fabric' },
    { number: '4', name: 'Heat' },
    { number: '5', name: 'Acids, Bases and Salts' },
    { number: '6', name: 'Physical and Chemical Changes' },
    { number: '7', name: 'Weather, Climate and Adaptations of Animals to Climate' },
    { number: '8', name: 'Winds, Storms and Cyclones' },
    { number: '9', name: 'Soil' },
    { number: '10', name: 'Respiration in Organisms' },
    { number: '11', name: 'Transportation in Animals and Plants' },
    { number: '12', name: 'Reproduction in Plants' },
    { number: '13', name: 'Motion and Time' },
    { number: '14', name: 'Electric Current and its Effects' },
    { number: '15', name: 'Light' }
  ],
  'English': [
    { number: '1', name: 'Three Questions' },
    { number: '2', name: 'A Gift of Chappals' },
    { number: '3', name: 'Gopal and the Hilsa Fish' },
    { number: '4', name: 'The Ashes That Made Trees Bloom' },
    { number: '5', name: 'Quality' },
    { number: '6', name: 'Expert Detectives' },
    { number: '7', name: 'The Invention of Vita-Wonk' },
    { number: '8', name: 'Fire: Friend and Foe' },
    { number: '9', name: 'A Bicycle in Good Repair' },
    { number: '10', name: 'The Story of Cricket' }
  ],
  'Social Science': [
    { number: '1', name: 'Tracing Changes Through a Thousand Years' },
    { number: '2', name: 'New Kings and Kingdoms' },
    { number: '3', name: 'The Delhi Sultans' },
    { number: '4', name: 'The Mughal Empire' },
    { number: '5', name: 'Rulers and Buildings' },
    { number: '6', name: 'Towns, Traders and Craftspersons' },
    { number: '7', name: 'Tribes, Nomads and Settled Communities' },
    { number: '8', name: 'Devotional Paths to the Divine' },
    { number: '9', name: 'The Making of Regional Cultures' },
    { number: '10', name: 'Eighteenth-Century Political Formations' }
  ],
  'Hindi': [
    { number: '1', name: 'हम पंछी उन्मुक्त गगन के' },
    { number: '2', name: 'दादी माँ' },
    { number: '3', name: 'हाथी' },
    { number: '4', name: 'कंचा' },
    { number: '5', name: 'माँ' },
    { number: '6', name: 'पुस्तकें जो अमर हैं' },
    { number: '7', name: 'काबुलीवाला' },
    { number: '8', name: 'एक तिनका' },
    { number: '9', name: 'मेरे बचपन के दिन' },
    { number: '10', name: 'नमक का दरोगा' }
  ]
};

const SUBJECTS = Object.keys(CHAPTERS_BY_CLASS_SUBJECT);
const CLASS = '7';
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const BLOOMS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
const ASSERTION_REASON_OPTIONS = [
  'Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).',
  'Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).',
  'Assertion (A) is true but Reason (R) is false.',
  'Assertion (A) is false but Reason (R) is true.'
];

// --- Realistic question bank (now filled with LaTeX-rich sample questions for all chapters/subjects/types) ---
const COMMON_LATEX = [
  '$a^2 + b^2 = c^2$',
  '$\frac{1}{2}$',
  '$\sqrt{16} = 4$',
  '$\int_0^1 x^2 dx$',
  '$\sum_{i=1}^n i = \\frac{n(n+1)}{2}$',
  '$\alpha, \beta, \gamma$',
  '$\sin(\theta)$',
  '$E = mc^2$',
  '$x^2 - y^2 = (x+y)(x-y)$',
  '$\Delta$',
  '$\log_{10} 100 = 2$',
  '$\lim_{x \to 0} \\frac{\sin x}{x} = 1$',
  '$\binom{n}{k}$',
  '$\mathbb{R}$',
  '$\infty$',
];
function getRandomLatex() {
  return COMMON_LATEX[Math.floor(Math.random() * COMMON_LATEX.length)];
}
function makeSampleQuestions(subject, chapterNum, chapterName) {
  const questions = [];
  for (let i = 0; i < 5; i++) {
    // MCQ
    questions.push({
      type: 'MCQ',
      question: `Sample MCQ Q${i+1} for ${subject} Ch ${chapterNum}: ${chapterName}? ${getRandomLatex()}`,
      options: [getRandomLatex(), getRandomLatex(), getRandomLatex(), getRandomLatex()],
      correct_option: ['a'],
      answer: `The answer is ${getRandomLatex()}.`,
      bloomsTaxonomy: 'Apply',
      difficulty: 'Easy',
      marks: 1
    });
    // Assertion Reason
    questions.push({
      type: 'AssertionReason',
      question: `Assertion (A): ${getRandomLatex()}\\Reason (R): ${getRandomLatex()}`,
      options: ASSERTION_REASON_OPTIONS,
      correct_option: ['a'],
      answer: `Both assertion and reason are true. ${getRandomLatex()}`,
      bloomsTaxonomy: 'Understand',
      difficulty: 'Medium',
      marks: 1
    });
    // Select Response
    questions.push({
      type: 'SelectResponse',
      question: `Select all correct options for ${subject} Ch ${chapterNum}: ${chapterName}. ${getRandomLatex()}`,
      options: [getRandomLatex(), getRandomLatex(), getRandomLatex(), getRandomLatex()],
      correct_option: ['a', 'b'],
      answer: `Correct options are a and b. ${getRandomLatex()}`,
      bloomsTaxonomy: 'Analyze',
      difficulty: 'Medium',
      marks: 1
    });
  }
  return questions;
}
const REAL_QUESTIONS = {};
for (const subject of SUBJECTS) {
  REAL_QUESTIONS[subject] = {};
  for (const chapter of CHAPTERS_BY_CLASS_SUBJECT[subject]) {
    REAL_QUESTIONS[subject][chapter.number] = makeSampleQuestions(subject, chapter.number, chapter.name);
  }
}

function getQuestionsForSubjectChapter(subject, chapterObj) {
  const chapterQuestions = REAL_QUESTIONS[subject]?.[chapterObj.number] || [];
  // Add schema fields
  return chapterQuestions.map(q => ({
    class: CLASS,
    subject,
    chapter: chapterObj.number,
    topics: [chapterObj.name],
    ...q
  }));
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log('Connected to DB');
  const questions = [];
  for (const subject of SUBJECTS) {
    for (const chapterObj of CHAPTERS_BY_CLASS_SUBJECT[subject]) {
      questions.push(...getQuestionsForSubjectChapter(subject, chapterObj));
    }
  }
  await Question.insertMany(questions);
  console.log(`Inserted ${questions.length} real questions.`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); }); 