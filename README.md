# Web Portal Documentation

## 1. Project Structure Overview

- **frontend/**: Next.js app, React components, API calls, UI logic
- **backend/**: Express.js server, API routes, controllers, models

## 2. API Route Mapping (Frontend ↔ Backend)

| Frontend File & Function | API Endpoint | HTTP Method | Backend Route | Controller Function | Parameters |
|-------------------------|--------------|-------------|--------------|--------------------|------------|
| pages/register-student.js (registerStudent) | /api/register-student | POST | /api/register-student | authController.registerStudent | { name, email, ... } |
| pages/register-teacher.js (registerTeacher) | /api/register-teacher | POST | /api/register-teacher | authController.registerTeacher | { name, email, ... } |
| pages/register-guardian.js (registerGuardian) | /api/register-guardian | POST | /api/register-guardian | authController.registerGuardian | { name, email, ... } |
| pages/register-guardian.js (sendRegisterOtp) | /api/send-register-otp | POST | /api/send-register-otp | authController.sendRegisterOtp | { email } |
| pages/register-guardian.js (verifyRegisterOtp) | /api/verify-register-otp | POST | /api/verify-register-otp | authController.verifyRegisterOtp | { email, otp } |
| pages/register-guardian.js (sendChildOtp) | /api/send-child-otp | POST | /api/send-child-otp | authController.sendChildOtp | { childEmail } |
| pages/register-guardian.js (verifyChildOtp) | /api/verify-child-otp | POST | /api/verify-child-otp | authController.verifyChildOtp | { childEmail, otp } |
| pages/manage-admins-users.js (getAdmins) | /api/getadmins | GET | /api/getadmins | adminController.getAdmins | - |
| pages/manage-admins-users.js (addAdmins) | /api/addadmins | POST | /api/addadmins | adminController.addAdmin | { email } |
| pages/manage-admins-users.js (removeAdmin) | /api/removeadmin | DELETE | /api/removeadmin | adminController.removeAdmin | { email } |
| pages/manage-admins-users.js (findUser) | /api/admin/find-user | POST | /api/admin/find-user | manageUserController.findUserByEmail | { email } |
| pages/manage-admins-users.js (deleteUser) | /api/admin/delete-user | DELETE | /api/admin/delete-user | manageUserController.deleteUserByEmail | { email } |
| pages/manage-admins-users.js (findStudent) | /api/admin/find-student | POST | /api/admin/find-student | manageUserController.findStudentByEmail | { email } |
| pages/manage-admins-users.js (findTeacher) | /api/admin/find-teacher | POST | /api/admin/find-teacher | manageUserController.findTeacherByEmail | { email } |
| pages/manage-admins-users.js (findGuardian) | /api/admin/find-guardian | POST | /api/admin/find-guardian | manageUserController.findGuardianByEmail | { email } |
| pages/manage-admins-users.js (allStudents) | /api/admin/all-students | POST | /api/admin/all-students | manageUserController.getAllStudents | - |
| pages/manage-admins-users.js (allTeachers) | /api/admin/all-teachers | POST | /api/admin/all-teachers | manageUserController.getAllTeachers | - |
| pages/manage-admins-users.js (allGuardians) | /api/admin/all-guardians | POST | /api/admin/all-guardians | manageUserController.getAllGuardians | - |
| pages/ProfileMenu.js (getProfile) | /api/profile | GET | /api/profile | profileController.getProfile | JWT |
| pages/ProfileMenu.js (updateProfile) | /api/profile | PUT | /api/profile | profileController.updateProfile | JWT, { ...profileData } |
| pages/ProfileMenu.js (getProfileVisibility) | /api/profile-visibility | GET | /api/profile-visibility | privacyController.getProfileVisibility | JWT |
| pages/ProfileMenu.js (updateProfileVisibility) | /api/profile-visibility | PUT | /api/profile-visibility | privacyController.updateProfileVisibility | JWT, { visible } |
| pages/delete-account.js (deleteAccount) | /api/delete-account | DELETE | /api/delete-account | deleteAccountController.deleteAccount | JWT |
| pages/teacher/settings.js (changePassword) | /api/change-password | POST | /api/change-password | passwordController.changePassword | JWT, { oldPassword, newPassword } |
| pages/teacher/settings.js (sendAltEmailOtp) | /api/send-alt-email-otp | POST | /api/send-alt-email-otp | alternativeEmailController.sendAltEmailOtp | JWT, { email } |
| pages/teacher/settings.js (verifyAltEmailOtp) | /api/verify-alt-email-otp | POST | /api/verify-alt-email-otp | alternativeEmailController.verifyAltEmailOtp | JWT, { email, otp } |
| pages/teacher/settings.js (getNotificationSettings) | /api/notification-settings | GET | /api/notification-settings | notificationSettingsController.getNotificationSettings | JWT |
| pages/teacher/settings.js (updateNotificationSettings) | /api/notification-settings | PUT | /api/notification-settings | notificationSettingsController.updateNotificationSettings | JWT, { ...settings } |
| pages/teacher/settings.js (getLoginActivity) | /api/login-activity | GET | /api/login-activity | loginActivityController.getLoginActivity | JWT |
| pages/teacher/settings.js (logout) | /api/logout | POST | /api/logout | loginActivityController.addLogoutEvent | JWT |
| pages/announcement.js (getAnnouncements) | /api/getannouncements | GET | /api/getannouncements | announcementController.getAnnouncements | JWT |
| pages/announcement.js (addAnnouncement) | /api/addannouncement | POST | /api/addannouncement | announcementController.createAnnouncement | JWT, { ...announcement } |
| pages/announcement.js (updateAnnouncement) | /api/updateannouncement/:id | PUT | /api/updateannouncement/:id | announcementController.updateAnnouncement | JWT, { ...announcement } |
| pages/announcement.js (deleteAnnouncement) | /api/removeannouncement/:id | DELETE | /api/removeannouncement/:id | announcementController.deleteAnnouncement | JWT |
| pages/announcement.js (markAnnouncementAsViewed) | /api/announcement/:announcementId/view | POST | /api/announcement/:announcementId/view | announcementController.markAnnouncementAsViewed | JWT |
| pages/cbse-updates.js (getCbseUpdates) | /api/cbse-updates | GET | /api/cbse-updates | cbseController.getCbseUpdates | - |
| pages/mindmaps.js (addMindMap) | /api/mindmap | POST | /api/mindmap | mindMapController.addMindMap | JWT, { ...mindmap } |
| pages/mindmaps.js (getMindMaps) | /api/mindmaps | GET | /api/mindmaps | mindMapController.getMindMaps | - |
| pages/mindmaps.js (deleteMindMap) | /api/mindmap/:id | DELETE | /api/mindmap/:id | mindMapController.deleteMindMap | JWT |
| pages/mindmaps.js (updateMindMap) | /api/mindmap/:id | PUT | /api/mindmap/:id | mindMapController.updateMindMap | JWT, { ...mindmap } |
| pages/avlrs.js (getAVLRs) | /api/avlrs | GET | /api/avlrs | avlrController.getAVLRs | - |
| pages/avlrs.js (addAVLR) | /api/avlr | POST | /api/avlr | avlrController.addAVLR | JWT, { ...avlr } |
| pages/avlrs.js (updateAVLR) | /api/avlr/:id | PUT | /api/avlr/:id | avlrController.updateAVLR | JWT, { ...avlr } |
| pages/avlrs.js (deleteAVLR) | /api/avlr/:id | DELETE | /api/avlr/:id | avlrController.deleteAVLR | JWT |
| pages/dlrs.js (getDLRs) | /api/dlrs | GET | /api/dlrs | dlrController.getDLRs | - |
| pages/dlrs.js (addDLR) | /api/dlr | POST | /api/dlr | dlrController.createDLR | { ...dlr } |
| pages/dlrs.js (updateDLR) | /api/dlr/:id | PUT | /api/dlr/:id | dlrController.updateDLR | { ...dlr } |
| pages/dlrs.js (deleteDLR) | /api/dlr/:id | DELETE | /api/dlr/:id | dlrController.deleteDLR | - |
| pages/dlrs.js (removeDLRPdf) | /api/dlr/:id/remove-pdf | POST | /api/dlr/:id/remove-pdf | dlrController.removeDLRPdf | - |
| pages/creative-corner.js (getCreativeItems) | /api/creative-corner | GET | /api/creative-corner | creativeCornerController.getCreativeItems | - |
| pages/creative-corner.js (addCreativeItem) | /api/creative-corner | POST | /api/creative-corner | creativeCornerController.addCreativeItem | JWT, { ...creativeItem } |
| pages/creative-corner.js (updateCreativeItem) | /api/creative-corner/:id | PUT | /api/creative-corner/:id | creativeCornerController.updateCreativeItem | JWT, { ...creativeItem } |
| pages/creative-corner.js (deleteCreativeItem) | /api/creative-corner/:id | DELETE | /api/creative-corner/:id | creativeCornerController.deleteCreativeItem | JWT |

*... (Add more as needed for quiz, discussion, etc.)*

## 3. Frontend File Exports, Functions, and Parameters

### Example: frontend/utils/auth.js
- `setToken(token)` — Store JWT token in localStorage
- `getToken()` — Retrieve JWT token
- `removeToken()` — Remove JWT token
- `isAuthenticated()` — Check if user is authenticated
- `getUserData()` — Get user data from localStorage
- `setUserData(userData)` — Store user data
- `removeUserData()` — Remove user data
- `setSessionId(sessionId)` — Store session ID
- `getSessionId()` — Retrieve session ID
- `removeSessionId()` — Remove session ID
- `logout()` — Log out user (removes all tokens/data)
- `isTokenExpired(token)` — Check if JWT token is expired
- `getStudentIdFromJWT()` — Extract student ID from JWT

### Example: frontend/utils/apiurl.js
- `BASE_API_URL` — Base URL for all API calls
- `apiFetch(path, options)` — Helper for fetch requests

*... (List all other frontend files and their exports similarly)*

## 4. Backend File Exports, Functions, and Parameters

### Example: backend/controller/authController.js
- `sendRegisterOtp(req, res)` — Send OTP for registration
- `verifyRegisterOtp(req, res)` — Verify registration OTP
- `registerStudent(req, res)` — Register a new student
- `registerGuardian(req, res)` — Register a new guardian
- `registerTeacher(req, res)` — Register a new teacher
- `loginStudent(req, res)` — Student login
- `loginGuardian(req, res)` — Guardian login
- `loginTeacher(req, res)` — Teacher login
- `sendChildOtp(req, res)` — Send OTP to child
- `verifyChildOtp(req, res)` — Verify child OTP
- `deleteUser(req, res)` — Delete user
- `checkChildVerified(req, res)` — Check if child is verified
- `verifyLoginOtp(req, res)` — Verify login OTP
- `sendLoginOtp(req, res)` — Send login OTP

*... (List all other backend controllers and their exports similarly)*

---

**How to Use This Documentation:**
- To update the UI or connect to backend APIs, find the relevant frontend file and function.
- Check the API endpoint, method, and parameters in the mapping table.
- See which backend controller and function handles the request.
- Refer to the exports section for details on function parameters and usage.

---

*This documentation is auto-generated for developer reference. Please update as you add new APIs or features.*
