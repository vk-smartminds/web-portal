# Quiz Merge: Migration Steps

## Step 1: Planning and Directory Setup

- Read all quiz-related files in both frontend and backend.
- Decided on new app-based routing structure:
  - Student quiz features will be under `frontend/app/student/quiz/`
  - Admin quiz features will be under `frontend/app/admin/quiz/`
- Will create new folders for each quiz feature (e.g., `attempt`, `past`, `report`, `[quizId]`) as needed.
- Will update all navigation and internal links to use the new routes.
- Will document each step in this file as changes are made. 

## Step 2: Directory Creation

- Created the following directories for app-based routing:
  - `frontend/app/student/quiz/attempt`
  - `frontend/app/student/quiz/past`
  - `frontend/app/student/quiz/report`
  - `frontend/app/student/quiz/[quizId]`
  - `frontend/app/admin/quiz/` 

## Step 3: Quiz Home Page Migration

- Migrated the quiz home page to `frontend/app/student/quiz/page.jsx`.
- Refactored to use `DashboardCommon` and `Sidebar` for consistent sidebar and profile display.
- Updated "Attempt Quiz" and "View Past Quizzes" buttons to be smaller and visually distinct.
- Updated navigation links to use new app-based routes (`/student/quiz/attempt`, `/student/quiz/past`). 

## Step 4: Quiz Feature Pages Migration

- Migrated all quiz feature pages to the new app-based routing structure:
  - `frontend/app/student/quiz/attempt/page.jsx`
  - `frontend/app/student/quiz/past/page.jsx`
  - `frontend/app/student/quiz/report/page.jsx`
  - `frontend/app/student/quiz/[quizId]/page.jsx`
  - `frontend/app/admin/quiz/page.jsx`
- All pages now use `DashboardCommon` and `Sidebar` for consistent sidebar and student/admin profile display.
- Updated imports and navigation to use new routes and ensure sidebar is always shown.
- Sidebar and profile are passed as props between pages for seamless navigation and UI consistency. 