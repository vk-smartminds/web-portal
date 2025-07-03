import AVLR from '../models/AVLR.js';

// Add AVLR
export const addAVLR = async (req, res) => {
  try {
    let { class: className, subject, chapter, link } = req.body;
    if (!className || !subject || !chapter || !link) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    className = className.trim().toLowerCase();
    subject = subject.trim().toLowerCase();
    chapter = chapter.trim().toLowerCase();
    const avlr = await AVLR.create({ class: className, subject, chapter, link });
    res.status(201).json({ message: 'AVLR added', avlr });
  } catch (err) {
    res.status(500).json({ message: 'Error adding AVLR', error: err.message });
  }
};

// Get AVLRs (optionally filter by class, subject, chapter)
export const getAVLRs = async (req, res) => {
  try {
    let { class: className, subject, chapter } = req.query;
    const filter = {};
    if (className) filter.class = className.trim().toLowerCase();
    if (subject) filter.subject = subject.trim().toLowerCase();
    if (chapter) filter.chapter = chapter.trim().toLowerCase();
    const avlrs = await AVLR.find(filter).sort({ class: 1, subject: 1, chapter: 1 });
    res.json({ avlrs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching AVLRs', error: err.message });
  }
};

// Update AVLR
export const updateAVLR = async (req, res) => {
  try {
    const { id } = req.params;
    let { class: className, subject, chapter, link } = req.body;
    if (!className || !subject || !chapter || !link) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    className = className.trim().toLowerCase();
    subject = subject.trim().toLowerCase();
    chapter = chapter.trim().toLowerCase();
    const avlr = await AVLR.findByIdAndUpdate(id, { class: className, subject, chapter, link }, { new: true });
    if (!avlr) return res.status(404).json({ message: 'AVLR not found' });
    res.json({ message: 'AVLR updated', avlr });
  } catch (err) {
    res.status(500).json({ message: 'Error updating AVLR', error: err.message });
  }
};

// Delete AVLR
export const deleteAVLR = async (req, res) => {
  try {
    const { id } = req.params;
    const avlr = await AVLR.findByIdAndDelete(id);
    if (!avlr) return res.status(404).json({ message: 'AVLR not found' });
    res.json({ message: 'AVLR deleted', id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting AVLR', error: err.message });
  }
}; 