# Updating Subjects, Chapters, and Weightages for Quiz Generation

This guide explains how to update the list of subjects, chapters, and their weightages for the quiz system. The configuration is split between the frontend and backend. **Both must be kept in sync** for correct quiz generation and display.

---

## 1. Frontend: `content.js`

**File:** `frontend/quiz/utils/content.js`

- This file defines the subjects and chapters available for each class, as well as the `weightage` for each chapter.
- The `weightage` field is used for display and selection in the admin/student UI.

**Example:**
```js
export const CHAPTERS_BY_CLASS_SUBJECT = {
  '7': {
    'Mathematics': [
      { number: '1', name: 'Integers', weightage: 7 },
      { number: '2', name: 'Fractions and Decimals', weightage: 8 },
      // ... more chapters ...
    ],
    // ... other subjects ...
  },
  // ... other classes ...
};
```

**To update:**
- Add/remove subjects or chapters as needed.
- Update the `weightage` value for any chapter as per the latest curriculum or guidelines.

---

## 2. Backend: `chapterWeightage.js`

**File:** `backend/quiz/utils/chapterWeightage.js`

- This file defines the weightage mapping for each chapter, used by the backend to distribute questions proportionally during quiz generation.
- The structure must match the frontend's `content.js` for class, subject, and chapter numbers.

**Example:**
```js
export const CHAPTER_WEIGHTAGE = {
  '7': {
    'Mathematics': {
      '1': 7, // Integers
      '2': 8, // Fractions and Decimals
      // ... more chapters ...
    }
  },
  // ... other classes/subjects ...
};
```

**To update:**
- Add/remove classes, subjects, or chapters as needed.
- Update the weightage value for any chapter to match the frontend.

---

## 3. Keeping Frontend and Backend in Sync

- Whenever you update the chapter list or weightages in the frontend, **make the same changes in the backend**.
- The chapter `number` in the frontend must match the key in the backend mapping.
- If you add a new subject or class, add it to both files.

---

## 4. Extending to More Classes/Subjects

- To support more classes or subjects, simply add their chapters and weightages to both files.
- The backend logic will automatically use the weightage-based distribution if the mapping exists for the selected class/subject.

---

## 5. Example Update Workflow

1. Update `frontend/quiz/utils/content.js` with new chapters/weightages.
2. Update `backend/quiz/utils/chapterWeightage.js` with the same chapters/weightages.
3. (Optional) Test by attempting a quiz for the updated class/subject to verify correct question distribution.

---

**Contact the development team if you have questions or need help updating these files.** 