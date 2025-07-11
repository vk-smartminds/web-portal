Removed duplicate/proxy files from frontend/pages/quiz. All quiz logic and UI now lives in frontend/quiz/pages and uses frontend/quiz/utils/content.js for all class/subject/chapter data.

Deleted files:
- frontend/pages/quiz/attempt.js
- frontend/pages/quiz/admin.js
- frontend/pages/quiz/[quizId].js
- frontend/pages/quiz/report.js
- frontend/pages/quiz/past.js
