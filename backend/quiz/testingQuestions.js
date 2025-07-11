// Script to bulk insert 300-400 sample questions for class 7 (all subjects/chapters)
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
const TYPES = ['MCQ', 'SelectResponse'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestion(subject, chapterObj, idx) {
  const type = getRandomElement(TYPES);
  const options = [
    `Option A for ${subject} ${chapterObj.name}`,
    `Option B for ${subject} ${chapterObj.name}`,
    `Option C for ${subject} ${chapterObj.name}`,
    `Option D for ${subject} ${chapterObj.name}`
  ];
  let correct_option;
  if (type === 'MCQ') {
    correct_option = [getRandomElement(['a', 'b', 'c', 'd'])];
  } else {
    // SelectResponse: 2 correct options
    const all = ['a', 'b', 'c', 'd'];
    correct_option = [getRandomElement(all)];
    let second;
    do { second = getRandomElement(all); } while (second === correct_option[0]);
    correct_option.push(second);
  }
  return {
    class: CLASS,
    subject,
    chapter: chapterObj.number,
    topics: [chapterObj.name],
    type,
    question: `Sample Q${idx + 1} for ${subject} Ch ${chapterObj.number}: ${chapterObj.name}?`,
    options,
    answer: `Explanation for Q${idx + 1} of ${subject} Ch ${chapterObj.number}`,
    correct_option,
    difficulty: getRandomElement(DIFFICULTIES),
    marks: 1
  };
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  });
  console.log('Connected to DB');
  const questions = [];
  let idx = 0;
  for (const subject of SUBJECTS) {
    for (const chapterObj of CHAPTERS_BY_CLASS_SUBJECT[subject]) {
      // 5 questions per chapter per subject
      for (let i = 0; i < 5; i++) {
        questions.push(generateQuestion(subject, chapterObj, idx++));
      }
    }
  }
  // Insert all
  await Question.insertMany(questions);
  console.log(`Inserted ${questions.length} questions.`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); }); 