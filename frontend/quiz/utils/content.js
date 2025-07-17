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
  '8': {
    'Mathematics': [
      { number: '1', name: 'Rational Numbers' },
      { number: '2', name: 'Linear Equations in One Variable' },
      { number: '3', name: 'Understanding Quadrilaterals' },
      { number: '4', name: 'Practical Geometry' },
      { number: '5', name: 'Data Handling' },
      { number: '6', name: 'Squares and Square Roots' },
      { number: '7', name: 'Cubes and Cube Roots' },
      { number: '8', name: 'Comparing Quantities' },
      { number: '9', name: 'Algebraic Expressions and Identities' },
      { number: '10', name: 'Visualising Solid Shapes' },
      { number: '11', name: 'Mensuration' },
      { number: '12', name: 'Exponents and Powers' },
      { number: '13', name: 'Direct and Inverse Proportions' },
      { number: '14', name: 'Factorisation' },
      { number: '15', name: 'Introduction to Graphs' },
      { number: '16', name: 'Playing with Numbers' }
    ],
    'Science': [
      { number: '1', name: 'Crop Production and Management' },
      { number: '2', name: 'Microorganisms: Friend and Foe' },
      { number: '3', name: 'Synthetic Fibres and Plastics' },
      { number: '4', name: 'Materials: Metals and Non-Metals' },
      { number: '5', name: 'Coal and Petroleum' },
      { number: '6', name: 'Combustion and Flame' },
      { number: '7', name: 'Conservation of Plants and Animals' },
      { number: '8', name: 'Cell — Structure and Functions' },
      { number: '9', name: 'Reproduction in Animals' },
      { number: '10', name: 'Reaching the Age of Adolescence' },
      { number: '11', name: 'Force and Pressure' },
      { number: '12', name: 'Friction' },
      { number: '13', name: 'Sound' },
      { number: '14', name: 'Chemical Effects of Electric Current' },
      { number: '15', name: 'Some Natural Phenomena' },
      { number: '16', name: 'Light' },
      { number: '17', name: 'Stars and the Solar System' },
      { number: '18', name: 'Pollution of Air and Water' }
    ],
    'English': [
      { number: '1', name: 'The Best Christmas Present in the World' },
      { number: '2', name: 'The Tsunami' },
      { number: '3', name: 'Glimpses of the Past' },
      { number: '4', name: 'Bepin Choudhury’s Lapse of Memory' },
      { number: '5', name: 'The Summit Within' },
      { number: '6', name: 'This is Jody’s Fawn' },
      { number: '7', name: 'A Visit to Cambridge' },
      { number: '8', name: 'A Short Monsoon Diary' },
      { number: '9', name: 'The Great Stone Face – I' },
      { number: '10', name: 'The Great Stone Face – II' }
    ],
    'Social Science': [
      { number: '1', name: 'How, When and Where' },
      { number: '2', name: 'From Trade to Territory' },
      { number: '3', name: 'Ruling the Countryside' },
      { number: '4', name: 'Tribals, Dikus and the Vision of a Golden Age' },
      { number: '5', name: 'When People Rebel' },
      { number: '6', name: 'Colonialism and the City' },
      { number: '7', name: 'Weavers, Iron Smelters and Factory Owners' },
      { number: '8', name: 'Civilising the "Native", Educating the Nation' },
      { number: '9', name: 'Women, Caste and Reform' },
      { number: '10', name: 'The Changing World of Visual Arts' },
      { number: '11', name: 'The Making of the National Movement: 1870s–1947' },
      { number: '12', name: 'India After Independence' }
    ],
    'Hindi': [
      { number: '1', name: 'ध्वनि' },
      { number: '2', name: 'लाख की चूड़ियाँ' },
      { number: '3', name: 'बस की यात्रा' },
      { number: '4', name: 'दीवानों की हस्ती' },
      { number: '5', name: 'चिट्ठियों की अनूठी दुनिया' },
      { number: '6', name: 'भगवान के डाकिए' },
      { number: '7', name: 'क्या निराश हुआ जाए' },
      { number: '8', name: 'यह सबसे कठिन समय नहीं' },
      { number: '9', name: 'एक कुत्ता और एक मैना' },
      { number: '10', name: 'संसार पुस्तक है' }
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
