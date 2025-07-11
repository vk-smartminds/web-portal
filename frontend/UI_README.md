# UI README

This documentation is for frontend/UI developers who want to change the UI only. It lists all relevant frontend files, their UI responsibilities, API calls, function parameters, and return types, structured file-wise.

---

## File List

- pages/Home.js
- pages/DashboardCommon.js
- pages/cbse-updates.js
- pages/settings.js
- pages/manage-admins-users.js
- pages/report.js
- pages/announcement.js
- pages/ProfileMenu.js
- pages/register-guardian.js
- pages/register-student.js
- pages/register-teacher.js
- pages/mindmaps.js
- pages/dlrs.js
- pages/avlrs.js
- pages/creative-corner.js
- pages/delete-account.js
- pages/discussion/index.js
- pages/quiz/index.js
- pages/quiz/attempt.js
- pages/quiz/report.js
- pages/quiz/past.js
- pages/quiz/admin.js
- pages/quiz/[quizId].js
- pages/admin/dashboard.js
- pages/admin/profile.js
- pages/guardian/dashboard.js
- pages/guardian/profile.js
- pages/teacher/dashboard.js
- pages/teacher/profile.js
- pages/student/dashboard.js
- pages/student/profile.js
- pages/ProfileCommon.js
- pages/Settings/PrivacySettings.js
- pages/Settings/NotificationSettings.js
- pages/Settings/ChangePassword.js
- pages/Settings/AccountSettings.js
- pages/Settings/AlternativeEmail.js
- pages/Settings/AppearanceSettings.js
- pages/Settings/SupportHelp.js
- components/ProtectedRoute.js
- components/NotificationPanel.js
- components/LoginActivityTable.js
- components/AVLR/AVLR.js
- components/Login/LoginForm.js
- components/Login/useLogin.js
- components/Login/ForgotPasswordModal.js
- components/Login/useOtpTimer.js
- components/Login/index.js
- components/AdminDashboard/Sidebar.jsx
- components/AdminDashboard/AdminFooter.js
- components/AdminDashboard/AdminSidebar.js
- components/AdminDashboard/AdminTopBar.js
- components/AdminDashboard/AdminDashboardFooter.js
- components/AdminDashboard/AdminDashboardSidebar.js
- components/AdminDashboard/AdminDashboardTopBar.js
- utils/auth.js
- utils/apiurl.js
- quiz/utils/adminApi.js
- quiz/utils/api.js
- quiz/utils/content.js
- quiz/pages/index.js
- quiz/pages/attempt.js
- quiz/pages/[quizId].js
- quiz/pages/report.js
- quiz/pages/past.js
- quiz/pages/admin.js
- app/layout.js
- app/page.js
- app/login/page.js
- service/api.js

---

## File-wise Details

### pages/Home.js
- **UI Role:** Home page displaying featured and recommended books.
- **Key Functions:** 
  - `BookGrid({ books, showAll, onClose })`: Renders a grid of book cards.
  - Navigation handlers: `handlePrev`, `handleNext`, `handleCoverPrev`, `handleCoverNext`.
- **API Calls:** None (all data is static in this file).
- **Parameters/Returns:** BookGrid receives a list of books and display options.

---

### pages/DashboardCommon.js
- **UI Role:** Common dashboard layout for different user types (admin, student, teacher, guardian).
- **Key Functions:**
  - `DashboardCommon({ SidebarComponent, menuItems, ... })`: Main dashboard wrapper.
  - `fetchProfile`: Fetches user profile from `/profile` (GET, JWT required).
  - `renderAnnouncementBadge(count)`: Renders a badge for new announcements.
- **API Calls:**
  - `GET /profile` (returns `{ user: {...} }`)
  - `GET /getannouncements?registeredAs=...` (returns `{ announcements: [...] }`)
  - `GET /notification-settings` (returns `{ notificationSettings: {...} }`)
- **Parameters/Returns:** Functions use JWT for auth, return user/announcement/settings objects.

---

### pages/cbse-updates.js
- **UI Role:** Displays CBSE updates in a styled list.
- **Key Functions:**
  - `CBSEUpdatesPage`: Main component.
- **API Calls:**
  - `GET /cbse-updates` (returns `{ updates: [{ title, link }] }`)
- **Parameters/Returns:** No parameters; expects JSON with updates array.

---

### pages/settings.js
- **UI Role:** Main settings page with navigation to sub-features (change password, alternative email, notification, privacy, etc.).
- **Key Functions:**
  - `SettingsPage`: Main component, handles navigation and feature display.
- **API Calls:** None directly; subcomponents handle their own API calls.
- **Parameters/Returns:** Uses JWT to determine user role and display relevant settings.

---

### pages/manage-admins-users.js
- **UI Role:** Admin page for managing admins, students, teachers, and guardians.
- **Key Functions:**
  - `ManageAdminsUsersPage`: Main component.
  - Handlers for add, remove, search, and view users/admins.
- **API Calls:**
  - `GET /getadmins` (returns `{ admins: [...] }`)
  - `POST /addadmins` (body: `{ email, isSuperAdmin, requesterEmail }`)
  - `DELETE /removeadmin` (body: `{ email, requesterEmail }`)
  - `POST /admin/find-user` (body: `{ email, requesterEmail }`)
  - `DELETE /admin/delete-user` (body: `{ email, requesterEmail }`)
  - `POST /admin/find-student` (body: `{ email, requesterEmail }`)
  - `POST /admin/find-teacher` (body: `{ email, requesterEmail }`)
  - `POST /admin/find-guardian` (body: `{ email, requesterEmail }`)
  - `POST /admin/all-students` (body: `{ requesterEmail }`)
  - `POST /admin/all-teachers` (body: `{ requesterEmail }`)
  - `POST /admin/all-guardians` (body: `{ requesterEmail }`)
- **Parameters/Returns:** All admin actions require JWT and requesterEmail; returns user/admin objects or status messages.

---

### pages/report.js
- **UI Role:** Quiz report page for students.
- **Key Functions:**
  - `QuizReport`: Fetches and displays quiz results.
- **API Calls:**
  - Uses `getQuiz(quizId)` from `../quiz/utils/api` (likely a GET to `/quiz/:quizId`).
- **Parameters/Returns:** Expects quizId, returns quiz object with status, score, questions, etc.

---

### pages/announcement.js
- **UI Role:** Announcement board for all users, with admin controls for creating/editing/deleting announcements.
- **Key Functions:**
  - `AnnouncementPage`: Main component.
  - `fetchAnnouncements`: Loads announcements based on user role.
  - Handlers for create, edit, delete, and mark as viewed.
- **API Calls:**
  - `GET /getannouncements?registeredAs=...`
  - `POST /addannouncement` (admin only, with form data)
  - `PUT /updateannouncement/:id` (admin only)
  - `DELETE /removeannouncement/:id` (admin only)
  - `PUT /announcement/:id/remove-image` (admin only)
  - `POST /announcement/:id/view` (mark as read)
- **Parameters/Returns:** Uses JWT, expects/returns announcement objects and status.

---

### pages/ProfileMenu.js
- **UI Role:** User profile menu and editor.
- **Key Functions:**
  - `ProfileMenu`: Main component.
  - Handlers for edit, save, cancel, delete photo, and logout.
- **API Calls:**
  - `GET /profile` (fetch user profile)
  - `PUT /profile` (update profile, with FormData)
- **Parameters/Returns:** Uses JWT, expects/returns user object and status.

---

### pages/register-guardian.js
- **UI Role:** Guardian registration page, including OTP verification and child linking.
- **Key Functions:**
  - `RegisterGuardian`: Main component, manages form state, OTP, and child verification.
  - Handlers: `handleSendOtp`, `handleRegister`, `handleSendChildOtp`, `handleVerifyChildOtp`, etc.
- **API Calls:**
  - `POST /send-register-otp` (body: `{ email, allowGuardian }`)
  - `POST /verify-register-otp` (body: `{ email, otp }`)
  - `POST /register-guardian` (body: `{ name, email, password, otp, child, role }`)
  - `POST /send-child-otp` (body: `{ childEmail }`)
  - `POST /verify-child-otp` (body: `{ childEmail, otp }`)
- **Parameters/Returns:** All endpoints expect JSON, return status and error/message.

---

### pages/register-student.js
- **UI Role:** Student registration page with OTP and password validation.
- **Key Functions:**
  - `RegisterStudent`: Main component, manages form state, OTP, and password.
  - Password helpers: `getPasswordRequirements`, `getPasswordSuggestions`.
- **API Calls:**
  - `POST /send-register-otp` (body: `{ email }`)
  - `POST /register-student` (body: `{ name, email, school, class, otp, password }`)
- **Parameters/Returns:** All endpoints expect JSON, return status and error/message.

---

### pages/register-teacher.js
- **UI Role:** Teacher registration page with OTP and password validation.
- **Key Functions:**
  - `RegisterTeacher`: Main component, manages form state, OTP, and password.
  - Password helpers: `getPasswordRequirements`, `getPasswordSuggestions`.
- **API Calls:**
  - `POST /send-register-otp` (body: `{ email }`)
  - `POST /register-teacher` (body: `{ name, email, otp, password }`)
- **Parameters/Returns:** All endpoints expect JSON, return status and error/message.

---

### pages/mindmaps.js
- **UI Role:** Mind maps resource page for students and teachers/admins.
- **Key Functions:**
  - `MindMapsPage`: Main component, manages mind map CRUD and filtering.
  - Handlers: `handleCreate`, `handleEdit`, `handleSaveEdit`, `handleDelete`, `handleFormChange`.
- **API Calls:**
  - `GET /mindmaps?class=...&subject=...&chapter=...` (returns `{ mindMaps: [...] }`)
  - `POST /mindmap` (FormData: `{ class, subject, chapter, mindmap[] }`)
  - `PUT /mindmap/:id` (FormData: `{ class, subject, chapter, mindmap[] }`)
  - `DELETE /mindmap/:id`
- **Parameters/Returns:** Uses JWT, expects/returns mind map objects and status.

---

### pages/dlrs.js
- **UI Role:** DLRs (Digital Learning Resources) resource page for students and teachers/admins.
- **Key Functions:**
  - `DlrsPage`: Main component, manages DLR CRUD and filtering.
  - Handlers: `handleCreate`, `handleEdit`, `handleSaveEdit`, `handleDelete`, `handleFormChange`.
- **API Calls:**
  - `GET /dlrs?class=...&subject=...&chapter=...` (returns `{ dlrs: [...] }`)
  - `POST /dlr` (FormData: `{ class, subject, chapter, pdfs[] }`)
  - `PUT /dlr/:id` (FormData: `{ class, subject, chapter, pdfs[] }`)
  - `DELETE /dlr/:id`
- **Parameters/Returns:** Uses JWT, expects/returns DLR objects and status.

---

### pages/avlrs.js
- **UI Role:** AVLRs (Audio-Visual Learning Resources) resource page for students and teachers/admins.
- **Key Functions:**
  - `AvlrsPage`: Main component, manages AVLR CRUD and filtering.
  - Handlers: `handleCreate`, `handleEdit`, `handleSaveEdit`, `handleDelete`, `handleFormChange`.
- **API Calls:**
  - `GET /avlrs?class=...&subject=...&chapter=...` (returns `{ avlrs: [...] }`)
  - `POST /avlr` (body: `{ class, subject, chapter, link }`)
  - `PUT /avlr/:id` (body: `{ class, subject, chapter, link }`)
  - `DELETE /avlr/:id`
- **Parameters/Returns:** Uses JWT, expects/returns AVLR objects and status.

---

### pages/creative-corner.js
- **UI Role:** Creative Corner resource page for students and teachers/admins.
- **Key Functions:**
  - `CreativeCornerPage`: Main component, manages creative item CRUD and filtering.
  - Handlers: `handleCreate`, `handleEdit`, `handleSaveEdit`, `handleDelete`, `handleFormChange`.
- **API Calls:**
  - `GET /creative-corner?class=...&subject=...&chapter=...&type=...` (returns `{ creativeItems: [...] }`)
  - `POST /creative-corner` (FormData: `{ class, subject, chapter, type, title, description, files[] }`)
  - `PUT /creative-corner/:id` (FormData: `{ class, subject, chapter, type, title, description, files[] }`)
  - `DELETE /creative-corner/:id`
- **Parameters/Returns:** Uses JWT, expects/returns creative item objects and status.

---

### pages/delete-account.js
- **UI Role:** Account deletion confirmation and action page.
- **Key Functions:**
  - `DeleteAccountPage`: Main component, manages confirmation and deletion.
  - Handler: `handleDelete`
- **API Calls:**
  - `DELETE /delete-account` (JWT required)
- **Parameters/Returns:** Uses JWT, returns status and error/message.

---

### pages/discussion/index.js
- **UI Role:** Discussion forum panel for threads and posts (Q&A, comments, voting, replies, etc.).
- **Key Functions:**
  - `DiscussionPanel`: Main component, manages threads, posts, replies, voting, editing, and deleting.
  - Helpers: `buildPostTree`, `getCurrentUser`, `PostTree`, `ReplyForm`.
  - Handlers: `fetchThreads`, `handleCreateThread`, `handleViewThread`, `handleMainReply`, `handleNestedReply`, `handleVoteThread`, `handleVotePost`, `handleEditPost`, `handleDeletePost`, etc.
- **API Calls:** (via `../../service/api`)
  - `createDiscussionThread` (POST `/discussion/thread`)
  - `fetchDiscussionThreads` (GET `/discussion/threads`)
  - `fetchDiscussionThread` (GET `/discussion/thread/:id`)
  - `addDiscussionPost` (POST `/discussion/post`)
  - `voteThread` (POST `/discussion/thread/:id/vote`)
  - `votePost` (POST `/discussion/post/:id/vote`)
  - `editDiscussionPost` (PUT `/discussion/post/:id`)
  - `deleteDiscussionPost` (DELETE `/discussion/post/:id`)
- **Parameters/Returns:** All endpoints use JWT, expect/return thread/post objects, votes, and status.

---

### pages/quiz/index.js
- **UI Role:** Quiz home page for students, with navigation to attempt or view past quizzes.
- **Key Functions:**
  - `QuizHome`: Main component, renders navigation buttons.
- **API Calls:** None directly (navigation only).

---

### pages/quiz/attempt.js
- **UI Role:** Quiz attempt page (re-exported from `frontend/quiz/pages/attempt.js`).
- **Key Functions:** All logic is in `frontend/quiz/pages/attempt.js`.
- **API Calls:** See `frontend/quiz/pages/attempt.js` for details.

---

### pages/quiz/report.js
- **UI Role:** Quiz report page (re-exported from `frontend/quiz/pages/report.js`).
- **Key Functions:** All logic is in `frontend/quiz/pages/report.js`.
- **API Calls:** See `frontend/quiz/pages/report.js` for details.

--- 

---

### pages/admin/dashboard.js
- **UI Role:** Admin dashboard page, provides navigation to admin features via sidebar (manage users, books, records, announcements, CBSE updates, mindmaps, reports, profile, AVLRs, DLRs, creative corner, discussion, notifications, quiz, settings).
- **Key Functions:**
  - `AdminSidebar`: Sidebar navigation for admin features.
  - `AdminDashboardPage`: Main dashboard wrapper using `DashboardCommon`.
- **API Calls:** None directly (navigation only).

---

### pages/admin/profile.js
- **UI Role:** Admin profile page, view and edit admin profile details.
- **Key Functions:**
  - `AdminProfilePage`: Fetches, displays, and edits admin profile.
  - Uses `ProfileCommon` for shared profile UI.
- **API Calls:**
  - `GET /profile` (fetch user profile)
  - `GET /profile-visibility` (fetch profile privacy settings)
  - `PUT /profile` (update profile, with FormData or JSON)
- **Parameters/Returns:** Uses JWT, expects/returns user object and status.

---

### pages/guardian/dashboard.js
- **UI Role:** Guardian dashboard page, provides navigation to guardian features via sidebar (child profile, assignments, messages, books, CBSE updates, announcements, timetable, digital resources, profile, creative corner, discussion, notifications, settings).
- **Key Functions:**
  - `ParentSidebar`: Sidebar navigation for guardian features.
  - `ParentDashboardPage`: Main dashboard wrapper using `DashboardCommon`.
- **API Calls:** None directly (navigation only).

---

### pages/guardian/profile.js
- **UI Role:** Guardian profile page, view and edit guardian profile details, view linked children.
- **Key Functions:**
  - `GuardianProfilePage`: Fetches, displays, and edits guardian profile.
  - Uses `ProfileCommon` for shared profile UI.
- **API Calls:**
  - `GET /profile` (fetch user profile)
  - `GET /profile-visibility` (fetch profile privacy settings)
  - `PUT /profile` (update profile, with FormData or JSON)
- **Parameters/Returns:** Uses JWT, expects/returns user object and status.

---

### pages/teacher/dashboard.js
- **UI Role:** Teacher dashboard page, provides navigation to teacher features via sidebar (test generator, CBSE updates, student performance, book solutions, announcements, timetable, messages, digital resources, profile, mind maps, AVLRs, DLRs, creative corner, discussion, notifications, settings).
- **Key Functions:**
  - `TeacherSidebar`: Sidebar navigation for teacher features.
  - `TeacherDashboardPage`: Main dashboard wrapper using `DashboardCommon`.
- **API Calls:** None directly (navigation only).

---

### pages/teacher/profile.js
- **UI Role:** Teacher profile page, view and edit teacher profile details.
- **Key Functions:**
  - `TeacherProfilePage`: Fetches, displays, and edits teacher profile.
  - Uses `ProfileCommon` for shared profile UI.
- **API Calls:**
  - `GET /profile` (fetch user profile)
  - `GET /profile-visibility` (fetch profile privacy settings)
  - `PUT /profile` (update profile, with FormData or JSON)
- **Parameters/Returns:** Uses JWT, expects/returns user object and status.

---

### pages/student/dashboard.js
- **UI Role:** Student dashboard page, provides navigation to student features via sidebar (CBSE updates, announcements, quiz, sample papers, AVLRs, DLRs, mind maps, discussion, creative corner, books, performance, profile, notifications, settings).
- **Key Functions:**
  - `StudentSidebar`: Sidebar navigation for student features.
  - `StudentDashboardPage`: Main dashboard wrapper using `DashboardCommon`.
- **API Calls:** None directly (navigation only).

---

### pages/student/profile.js
- **UI Role:** Student profile page, view and edit student profile details, view linked guardians.
- **Key Functions:**
  - `StudentProfilePage`: Fetches, displays, and edits student profile.
  - Uses `ProfileCommon` for shared profile UI.
- **API Calls:**
  - `GET /profile` (fetch user profile)
  - `GET /profile-visibility` (fetch profile privacy settings)
  - `PUT /profile` (update profile, with FormData or JSON)
- **Parameters/Returns:** Uses JWT, expects/returns user object and status.

---

### pages/ProfileCommon.js
- **UI Role:** Shared profile UI component for admin, guardian, teacher, and student profile pages. Handles edit/view modes, photo upload, phone input, and custom fields.
- **Key Functions:**
  - `ProfileCommon`: Main shared profile component.
  - `PhoneInputBoxes`: Helper for phone number input.
- **API Calls:** None directly (used by profile pages).

---

### pages/Settings/PrivacySettings.js
- **UI Role:** Privacy settings page, allows users to toggle visibility of profile fields.
- **Key Functions:**
  - `PrivacySettings`: Fetches, displays, and updates privacy settings.
- **API Calls:**
  - `GET /profile-visibility` (fetch privacy settings)
  - `PUT /profile-visibility` (update privacy settings)
- **Parameters/Returns:** Uses JWT, expects/returns privacy settings object and status.

---

### pages/Settings/NotificationSettings.js
- **UI Role:** Notification settings page, allows users to toggle notification preferences.
- **Key Functions:**
  - `NotificationSettings`: Fetches, displays, and updates notification settings.
- **API Calls:**
  - `GET /notification-settings` (fetch notification settings)
  - `PUT /notification-settings` (update notification settings)
- **Parameters/Returns:** Uses JWT, expects/returns notification settings object and status.

---

### pages/Settings/ChangePassword.js
- **UI Role:** Change password page, allows users to verify current password and set a new password.
- **Key Functions:**
  - `ChangePassword`: Handles password verification and update.
- **API Calls:**
  - `POST /change-password` (verify current password and/or update password)
- **Parameters/Returns:** Uses JWT, expects `{ currentPassword, newPassword, confirmNewPassword }`, returns status and error/message.

---

### pages/Settings/AccountSettings.js
- **UI Role:** Account settings page, provides access to delete account and login activity.
- **Key Functions:**
  - `AccountSettings`: Renders delete account button and login activity table.
- **API Calls:** None directly (delete account handled in separate page).

---

### pages/Settings/AlternativeEmail.js
- **UI Role:** Alternative email settings page, allows users to set or change an alternative email with OTP verification.
- **Key Functions:**
  - `AlternativeEmail`: Handles alternative email input, OTP send/verify, and update.
- **API Calls:**
  - `POST /send-alt-email-otp` (send OTP to alternative email)
  - `POST /verify-alt-email-otp` (verify OTP and update alternative email)
  - `GET /profile` (fetch current alternative email)
- **Parameters/Returns:** Uses JWT, expects/returns status and error/message.

---

### pages/Settings/AppearanceSettings.js
- **UI Role:** Appearance settings page, allows users to toggle dark mode.
- **Key Functions:**
  - `AppearanceSettings`: Handles dark mode toggle and applies global CSS.
- **API Calls:** None.

---

### pages/Settings/SupportHelp.js
- **UI Role:** Support and help page, provides contact and social media links for support.
- **Key Functions:**
  - `SupportHelp`: Renders support email and social links.
- **API Calls:** None.

--- 

---

### components/ProtectedRoute.js
- **UI Role:** Higher-order component to protect routes based on authentication and role-based access control (RBAC). Redirects unauthenticated or unauthorized users to login or their dashboard.
- **Key Functions:**
  - `ProtectedRoute({ children, allowedRoles })`: Checks JWT, role, and token validity; handles redirects; renders children if valid.
  - `getRoleFromToken(token)`: Extracts user role from JWT.
- **API Calls:**
  - `GET /verify-token` (header: `Authorization: Bearer <token>`) — verifies token validity with backend. Returns 200 OK or error.
- **Parameters/Returns:**
  - `children`: React nodes to render if access is valid.
  - `allowedRoles`: Array of allowed roles (optional).
  - Returns: Renders children or redirects.

---

### components/NotificationPanel.js
- **UI Role:** Displays a list of user notifications (discussion votes, replies, etc.) with infinite scroll, mark-as-read, and delete actions.
- **Key Functions:**
  - `NotificationPanel()`: Fetches, paginates, and displays notifications; handles mark-as-read and delete.
- **API Calls:**
  - `GET /discussion/notifications?page=<page>&limit=20` (header: `Authorization: Bearer <token>`) — fetch notifications.
  - `POST /discussion/notifications/:id/read` — mark notification as read.
  - `DELETE /discussion/notifications/:id` — delete notification.
- **Parameters/Returns:**
  - Returns: Renders notification list UI.
  - Notification object: `{ _id, type, thread, post, isRead, createdAt }`

---

### components/LoginActivityTable.js
- **UI Role:** Shows a table of user login/logout activity, session duration, IP, and device info.
- **Key Functions:**
  - `LoginActivityTable({ showSessionDuration })`: Fetches and displays login sessions.
  - `formatDuration(seconds)`: Helper to format session duration.
- **API Calls:**
  - `GET /login-activity` (header: `Authorization: Bearer <token>`) — fetches login sessions. Returns `{ sessions: [...] }`.
- **Parameters/Returns:**
  - `showSessionDuration`: Boolean to show/hide session duration column.
  - Returns: Renders table of sessions.

---

### components/AVLR/AVLR.js
- **UI Role:** Placeholder component for AVLR feature. Displays props as JSON.
- **Key Functions:**
  - `AVLR(props)`: Renders placeholder and props.
- **API Calls:** None.
- **Parameters/Returns:**
  - `props`: Any props passed to the component.
  - Returns: Renders placeholder UI.

---

### components/Login/LoginForm.js
- **UI Role:** Main login form UI for password and OTP login, with VK branding, error handling, and forgot password modal.
- **Key Functions:**
  - `LoginForm(props)`: Renders login UI, handles form state, toggles, and forgot password modal.
  - `apiSendOtp(email)`, `apiVerifyOtp(email, otp)`, `apiResetPassword(email, otp, password)`: Call forgot password APIs.
- **API Calls:**
  - `POST /forgot-password/send-otp` — send OTP for password reset.
  - `POST /forgot-password/verify-otp` — verify OTP.
  - `POST /forgot-password/reset` — reset password.
- **Parameters/Returns:**
  - `props`: Includes all login state and handlers (see useLogin.js).
  - Returns: Renders login UI.

---

### components/Login/useLogin.js
- **UI Role:** Custom React hook to manage login state, logic, and API calls for password and OTP login.
- **Key Functions:**
  - `useLogin()`: Returns all state and handlers for login.
  - `handlePasswordLogin(e)`: Handles password login for admin, student, teacher, guardian.
  - `handleSendOtp()`: Sends OTP for login.
  - `handleOtpLogin(e)`: Handles OTP login.
- **API Calls:**
  - `POST /admin/login`, `POST /login-student`, `POST /login-teacher`, `POST /login-guardian` — password login for each role.
  - `POST /send-login-otp` — send OTP for login.
- **Parameters/Returns:**
  - Returns: `{ mode, setMode, email, setEmail, password, setPassword, ...handlers }` for use in LoginForm.

---

### components/Login/ForgotPasswordModal.js
- **UI Role:** Modal for forgot password flow: send OTP, verify OTP, reset password.
- **Key Functions:**
  - `ForgotPasswordModal({ open, onClose, onSuccess, apiSendOtp, apiVerifyOtp, apiResetPassword, ...branding })`: Handles all steps of password reset.
  - `handleSendOtp()`, `handleVerifyOtp(e)`, `handleResetPassword(e)`: Step handlers.
- **API Calls:**
  - Uses `apiSendOtp`, `apiVerifyOtp`, `apiResetPassword` passed as props (see LoginForm.js).
- **Parameters/Returns:**
  - `open`: Boolean to show/hide modal.
  - `onClose`, `onSuccess`: Callbacks.
  - Returns: Renders modal UI.

---

### components/Login/useOtpTimer.js
- **UI Role:** Custom React hook for OTP countdown timer logic.
- **Key Functions:**
  - `useOtpTimer(initialSeconds)`: Returns `{ timeLeft, expired, start, reset }` for timer management.
- **API Calls:** None.
- **Parameters/Returns:**
  - `initialSeconds`: Number of seconds for timer (default: 120).
  - Returns: `{ timeLeft, expired, start, reset }`.

---

### components/Login/index.js
- **UI Role:** Combines `useLogin` hook and `LoginForm` component for login page.
- **Key Functions:**
  - `Login()`: Passes login state/handlers to LoginForm.
- **API Calls:** None directly.
- **Parameters/Returns:**
  - Returns: Renders LoginForm with login props.

---

### components/AdminDashboard/Sidebar.jsx
- **UI Role:** Sidebar navigation for dashboard, with sections, icons, and user avatar.
- **Key Functions:**
  - `Sidebar({ sections, current, onSectionChange, user })`: Renders navigation and handles section changes.
- **API Calls:** None.
- **Parameters/Returns:**
  - `sections`: Array of nav sections.
  - `current`: Current section key.
  - `onSectionChange`: Handler for section change.
  - `user`: User object (avatar, name).
  - Returns: Renders sidebar UI.

---

### components/AdminDashboard/AdminFooter.js
- **UI Role:** Footer for admin dashboard.
- **Key Functions:**
  - `AdminFooter()`: Renders footer.
- **API Calls:** None.
- **Parameters/Returns:**
  - Returns: Renders footer UI.

---

### components/AdminDashboard/AdminSidebar.js
- **UI Role:** Sidebar for admin panel, with menu items, super admin actions, and logout.
- **Key Functions:**
  - `AdminSidebar({ userEmail, userPhoto, onMenuSelect, selectedMenu, isSuperAdmin, setShowAddAdmin, setShowRemoveAdmin, setShowViewAdmins })`: Renders menu and handles actions.
- **API Calls:** None.
- **Parameters/Returns:**
  - Various props for menu state and actions.
  - Returns: Renders sidebar UI.

---

### components/AdminDashboard/AdminTopBar.js
- **UI Role:** Top bar/header for admin dashboard.
- **Key Functions:**
  - `AdminTopBar()`: Renders top bar.
- **API Calls:** None.
- **Parameters/Returns:**
  - Returns: Renders header UI.

---

### components/AdminDashboard/AdminDashboardFooter.js
- **UI Role:** Footer for admin dashboard (duplicate of AdminFooter).
- **Key Functions:**
  - `AdminDashboardFooter()`: Renders footer.
- **API Calls:** None.
- **Parameters/Returns:**
  - Returns: Renders footer UI.

---

### components/AdminDashboard/AdminDashboardSidebar.js
- **UI Role:** Sidebar for admin dashboard (duplicate of AdminSidebar, for dashboard context).
- **Key Functions:**
  - `AdminDashboardSidebar({ userEmail, userPhoto, onMenuSelect, selectedMenu, isSuperAdmin, setShowAddAdmin, setShowRemoveAdmin, setShowViewAdmins })`: Renders menu and handles actions.
- **API Calls:** None.
- **Parameters/Returns:**
  - Various props for menu state and actions.
  - Returns: Renders sidebar UI.

---

### components/AdminDashboard/AdminDashboardTopBar.js
- **UI Role:** Top bar/header for admin dashboard (duplicate of AdminTopBar).
- **Key Functions:**
  - `AdminDashboardTopBar()`: Renders top bar.
- **API Calls:** None.
- **Parameters/Returns:**
  - Returns: Renders header UI. 

---

### utils/auth.js
- **UI Role:** Utility for JWT token, user data, and session management in localStorage. Used for authentication, session, and logout logic across the app.
- **Key Functions:**
  - `setToken(token)`, `getToken()`, `removeToken()`: Manage JWT in localStorage.
  - `isAuthenticated()`: Returns true if JWT exists.
  - `getUserData()`, `setUserData(userData)`, `removeUserData()`: Manage user data in localStorage.
  - `setSessionId(id)`, `getSessionId()`, `removeSessionId()`: Manage session ID in localStorage.
  - `logout()`: Calls backend `/logout` and clears all local user/session data.
  - `isTokenExpired(token)`: Checks if JWT is expired.
  - `getStudentIdFromJWT()`: Extracts student ID from JWT payload.
- **API Calls:**
  - `POST /logout` (header: `Authorization: Bearer <token>`, body: `{ sessionId }`) — logs out user session.
- **Parameters/Returns:**
  - Returns: Various helpers for token/session/user management.

---

### utils/apiurl.js
- **UI Role:** Centralizes the base API URL for all frontend API calls. Provides a helper for fetch requests.
- **Key Functions:**
  - `BASE_API_URL`: The base URL for backend API (from env or default).
  - `apiFetch(path, options)`: Helper for fetch requests with base URL.
- **API Calls:** None directly.
- **Parameters/Returns:**
  - Returns: API URL string and fetch helper.

---

### quiz/utils/adminApi.js
- **UI Role:** Utility for admin quiz management API calls (questions CRUD).
- **Key Functions:**
  - `getQuestions(filters)`: Fetches questions with optional filters.
  - `addQuestion(data)`: Adds a new question (JSON or FormData).
  - `updateQuestion(id, data)`: Updates a question by ID.
  - `deleteQuestion(id)`: Deletes a question by ID.
- **API Calls:**
  - `GET /api/admin/quiz/questions?filters` — fetch questions.
  - `POST /api/admin/quiz/question` — add question.
  - `PUT /api/admin/quiz/question/:id` — update question.
  - `DELETE /api/admin/quiz/question/:id` — delete question.
- **Parameters/Returns:**
  - Returns: JSON responses for each action.

---

### quiz/utils/api.js
- **UI Role:** Utility for student quiz API calls (subjects, chapters, attempt, report, submit, past quizzes).
- **Key Functions:**
  - `getAvailableSubjects(className)`: Fetches subjects for a class.
  - `getAvailableChapters(className, subject)`: Fetches chapters for class/subject.
  - `attemptQuiz(data)`: Starts a quiz attempt.
  - `getQuiz(quizId)`: Fetches quiz report/details.
  - `submitQuiz(quizId, responses)`: Submits quiz answers.
  - `getPastQuizzes(studentId)`: Fetches past quizzes for a student.
- **API Calls:**
  - `GET /quiz/subjects?class=...`, `GET /quiz/chapters?class=...&subject=...`
  - `POST /quiz/attempt`, `POST /quiz/submit/:quizId`
  - `GET /quiz/report/:quizId`, `GET /quiz/my-quizzes/:studentId`
- **Parameters/Returns:**
  - Returns: JSON responses for each action.

---

### quiz/utils/content.js
- **UI Role:** Centralized mapping for subjects, chapters, and question types by class. Used for quiz creation and display.
- **Key Functions:**
  - `SUBJECTS_BY_CLASS`: Map of class to subjects.
  - `CHAPTERS_BY_CLASS_SUBJECT`: Map of class/subject to chapters.
  - `QUESTION_TYPE_MAP`: Maps display names to backend type values.
  - `ASSERTION_REASON_OPTIONS`: Default options for assertion-reason questions.
- **API Calls:** None.
- **Parameters/Returns:**
  - Returns: Data structures for quiz content.

---

### quiz/pages/index.js
- **UI Role:** Quiz home page for students. Provides navigation to attempt quiz or view past quizzes.
- **Key Functions:**
  - `QuizHome()`: Renders home UI and navigation.
  - `QuizHomeProtected()`: Wraps home in `ProtectedRoute` for students.
- **API Calls:** None directly.
- **Parameters/Returns:**
  - Returns: Renders quiz home UI.

---

### quiz/pages/attempt.js
- **UI Role:** Quiz attempt page for students. Handles quiz setup, instructions, and starting a quiz.
- **Key Functions:**
  - `AttemptQuiz()`: Handles quiz setup, subject/chapter selection, and instructions.
  - `QuizInstructions({ quizDetails, onStart })`: Shows quiz details and instructions.
  - Various handlers for subject/chapter/type selection.
- **API Calls:**
  - `GET /student/class/:id` — fetches student class.
  - Uses quiz/utils/api.js for quiz attempt logic.
- **Parameters/Returns:**
  - Returns: Renders quiz setup and instructions UI.

---

### quiz/pages/[quizId].js
- **UI Role:** Quiz attempt page for a specific quiz. Handles question navigation, answer selection, palette, timer, and submission.
- **Key Functions:**
  - `QuizInfoPage({ quiz, onStart })`: Shows quiz details and instructions.
  - `QuizAttemptPage()`: Handles quiz logic, state, and submission.
  - Various helpers for palette, timer, navigation, and localStorage state.
- **API Calls:**
  - `GET /quiz/report/:quizId` — fetch quiz details.
  - `POST /quiz/submit/:quizId` — submit quiz answers.
  - `GET /api/student/:id` — fetch student profile.
- **Parameters/Returns:**
  - Returns: Renders quiz attempt UI.

---

### quiz/pages/report.js
- **UI Role:** Quiz report page for students. Shows quiz results, solutions, and stats.
- **Key Functions:**
  - `QuizReport()`: Fetches and displays quiz report.
  - `QuizReportProtected()`: Wraps report in `ProtectedRoute` for students.
- **API Calls:**
  - `GET /quiz/report/:quizId` — fetch quiz report.
- **Parameters/Returns:**
  - Returns: Renders quiz report UI.

---

### quiz/pages/past.js
- **UI Role:** Past quizzes page for students. Lists completed quizzes and links to reports.
- **Key Functions:**
  - `PastQuizzes()`: Fetches and displays past quizzes.
  - `PastQuizzesProtected()`: Wraps in `ProtectedRoute` for students.
- **API Calls:**
  - `GET /quiz/my-quizzes/:studentId` — fetch past quizzes.
- **Parameters/Returns:**
  - Returns: Renders past quizzes table.

---

### quiz/pages/admin.js
- **UI Role:** Admin quiz management page. Allows admin to search, add, edit, and delete quiz questions.
- **Key Functions:**
  - `AdminQuizPage()`: Handles admin quiz management logic and UI.
  - Uses quiz/utils/adminApi.js for API calls.
- **API Calls:**
  - `GET /api/admin/quiz/questions?filters`, `POST /api/admin/quiz/question`, `PUT /api/admin/quiz/question/:id`, `DELETE /api/admin/quiz/question/:id`
- **Parameters/Returns:**
  - Returns: Renders admin quiz management UI.

--- 

---

### app/layout.js
- **UI Role:** Root layout for the Next.js app directory. Wraps all app pages in HTML and body tags.
- **Key Functions:**
  - `RootLayout({ children })`: Renders children inside HTML/body structure.
- **API Calls:** None.
- **Parameters/Returns:**
  - `children`: React nodes to render as page content.
  - Returns: Renders HTML structure for app.

---

### app/page.js
- **UI Role:** Main entry page for the app directory. Renders the legacy Home page.
- **Key Functions:**
  - `Page()`: Renders `Home` from `pages/Home.js`.
- **API Calls:** None.
- **Parameters/Returns:**
  - Returns: Renders Home page UI.

---

### app/login/page.js
- **UI Role:** Login page for the app directory. Renders the legacy Login page.
- **Key Functions:**
  - `LoginPage()`: Renders `Login` from `pages/Login.js`.
- **API Calls:** None.
- **Parameters/Returns:**
  - Returns: Renders Login page UI.

---

### service/api.js
- **UI Role:** Centralized API utility using Axios for all authenticated and discussion-related API calls. Handles JWT, error handling, and redirects.
- **Key Functions:**
  - `api`: Axios instance with interceptors for JWT and error handling.
  - `deleteAccount(email)`: Deletes user account via `/user/delete`.
  - `fetchVideos()`, `addVideo(video, token)`, `updateVideo(id, video, token)`, `deleteVideo(id, token)`: Video CRUD APIs.
  - Discussion APIs: `createDiscussionThread`, `fetchDiscussionThreads`, `fetchDiscussionThread`, `addDiscussionPost`, `voteThread`, `votePost`, `editDiscussionPost`, `deleteDiscussionPost`.
- **API Calls:**
  - `POST /user/delete` — delete account.
  - `GET/POST/PUT/DELETE /videos` — video CRUD.
  - `POST /discussion/threads`, `GET /discussion/threads`, `GET /discussion/threads/:id`, `POST /discussion/threads/:id/posts`, `POST /discussion/threads/:id/vote`, `POST /discussion/threads/:id/posts/:postId/vote`, `PUT /discussion/threads/:id/posts/:postId`, `DELETE /discussion/threads/:id/posts/:postId` — discussion APIs.
- **Parameters/Returns:**
  - Various parameters for each function (see code for details).
  - Returns: Axios responses or data objects.

--- 