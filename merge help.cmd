:: MERGE HELP DOCUMENTATION
::
:: This file is intended to help with merging and onboarding for the new changes in this branch.
::
:: OVERVIEW OF CHANGES
:: -------------------
:: - Only a few main files in the backend and frontend were modified.
:: - Most new code is isolated in separate directories (e.g., backend/quiz/ and frontend/quiz/).
:: - This should minimize merge conflicts with ongoing work in other areas.
::
:: MAIN FILES MODIFIED
:: -------------------
:: - backend/routes/routes.js: Added quiz-related routes and integrated quiz modules.
:: - Other minor changes in controllers or utility files as needed for integration.
::
:: QUIZ FUNCTIONALITY STRUCTURE
:: ----------------------------
:: BACKEND:
::   - All quiz logic is under backend/quiz/ (models, routes, quizServer.js, etc.).
::   - Quiz endpoints are registered in backend/routes/routes.js via:
::       router.use('/api/admin/quiz', adminQuizRoutes);
::       router.use('/api/quiz', quizRoutes);
::   - Quiz models: backend/quiz/models/Question.js, Quiz.js
::   - Quiz routes: backend/quiz/routes/adminQuizRoutes.js, quizRoutes.js
::
:: FRONTEND:
::   - All quiz-related pages and components are under frontend/quiz/ and frontend/pages/quiz/.
::   - Quiz pages: [quizId].js, admin.js, attempt.js, index.js, past.js, report.js
::   - Quiz utilities: frontend/quiz/utils/
::   - Quiz styles: frontend/quiz/styles/
::
:: HOW TO TEST QUIZ FUNCTIONALITY
:: ------------------------------
:: 1. Start the backend server (ensure backend/quiz/ is included in the server startup).
:: 2. Access quiz features via the frontend at /quiz or /quiz/[quizId].
:: 3. Admin quiz management is available at /quiz/admin.
:: 4. Quiz attempts, reports, and past quizzes are available for users.
::
:: MERGE TIPS
:: ----------
:: - Since most quiz code is isolated, merging should be straightforward.
:: - If there are conflicts, they are likely in backend/routes/routes.js or shared utility files.
:: - Review quiz endpoints and ensure they are not duplicated in other branches.
:: - Test quiz creation, attempt, and report flows after merging.
