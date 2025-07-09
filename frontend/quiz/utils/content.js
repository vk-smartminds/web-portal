// content.js
// Centralized mapping for subjects and chapters by class

export const SUBJECTS_BY_CLASS = {
  '6': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
  '7': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
  '8': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
  '9': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
  '10': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
  '11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics', 'Accountancy', 'Business Studies', 'Computer Science'],
  '12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics', 'Accountancy', 'Business Studies', 'Computer Science'],
  'JEE': ['Mathematics', 'Physics', 'Chemistry'],
  'NEET': ['Physics', 'Chemistry', 'Biology'],
  'CUET': [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics', 'Accountancy', 'Business Studies', 'Computer Science',
    'History', 'Political Science', 'Geography', 'Sociology', 'Psychology', 'General Test', 'Legal Studies', 'Entrepreneurship', 'Physical Education', 'Hindi', 'Environmental Science', 'Home Science', 'Engineering Graphics', 'Fine Arts', 'Mass Media', 'Performing Arts', 'Agriculture', 'Anthropology', 'Knowledge Tradition', 'Teaching Aptitude', 'Tourism', 'Bengali', 'Punjabi', 'Sanskrit', 'Urdu', 'Other Languages'
  ]
};

// Example: You can expand this as needed
export const CHAPTERS_BY_CLASS_SUBJECT = {
  '7': {
    'Mathematics': [
      { number: '1', name: 'Integers', weightage: 7 },
      { number: '2', name: 'Fractions and Decimals', weightage: 8 },
      { number: '3', name: 'Data Handling', weightage: 6 },
      { number: '4', name: 'Simple Equations', weightage: 7 },
      { number: '5', name: 'Lines and Angles', weightage: 5 },
      { number: '6', name: 'The Triangle and its Properties', weightage: 8 },
      { number: '7', name: 'Congruence of Triangles', weightage: 6 },
      { number: '8', name: 'Comparing Quantities', weightage: 7 },
      { number: '9', name: 'Rational Numbers', weightage: 6 },
      { number: '10', name: 'Practical Geometry', weightage: 5 },
      { number: '11', name: 'Perimeter and Area', weightage: 7 },
      { number: '12', name: 'Algebraic Expressions', weightage: 8 },
      { number: '13', name: 'Exponents and Powers', weightage: 5 },
      { number: '14', name: 'Symmetry', weightage: 5 },
      { number: '15', name: 'Visualising Solid Shapes', weightage: 5 }
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
  },
  // Add other classes and subjects as needed
};

// Mapping from display names to backend type values
export const QUESTION_TYPE_MAP = {
  'Multiple Choice Questions': 'MCQ',
  'Assertion and Reason Based Questions': 'AssertionReason',
  'Select Response Questions': 'SelectResponse',
};

// Default options for Assertion Reason type questions (centralized)
export const ASSERTION_REASON_OPTIONS = [
  'Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).',
  'Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).',
  'Assertion (A) is true but Reason (R) is false.',
  'Assertion (A) is false but Reason (R) is true.'
];
