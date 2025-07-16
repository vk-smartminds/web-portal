import DiscussionNotification from '../models/discussion/DiscussionNotification.js';

// Get notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await DiscussionNotification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

// Mark notifications as read
export const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationIds } = req.body;
    await DiscussionNotification.updateMany(
      { recipientId: userId, _id: { $in: notificationIds } },
      { $set: { read: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications as read', error: err.message });
  }
}; 