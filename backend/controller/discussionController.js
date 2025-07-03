import DiscussionThread from '../models/discussion/DiscussionThread.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';
import multer from 'multer';
import DiscussionNotification from '../models/discussion/DiscussionNotification.js';
import DiscussionPost from '../models/discussion/DiscussionPost.js';

const getUserInfo = async (id, model) => {
  let userModel;
  switch (model) {
    case 'Student': userModel = Student; break;
    case 'Teacher': userModel = Teacher; break;
    case 'Guardian': userModel = Guardian; break;
    case 'Admin': userModel = Admin; break;
    default: return { email: 'Unknown', name: '', role: model };
  }
  const user = await userModel.findById(id).lean();
  if (!user) return { email: 'Unknown', name: '', role: model };
  return { email: user.email || 'Unknown', name: user.name || '', role: model };
};

// Multer config for memory storage (buffer)
const threadUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only jpg, png images allowed'));
    cb(null, true);
  }
});

const postUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
  fileFilter: (req, file, cb) => {
    // Accept jpg/jpeg/png images only
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/pjpeg'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Only jpg, png images allowed'));
    cb(null, true);
  }
});
export { threadUpload, postUpload };

// Create a thread
export const createThread = async (req, res) => {
  try {
    const { title, body } = req.body;
    let tags = req.body.tags || req.body['tags[]'] || [];
    let tagsArr = [];
    if (Array.isArray(tags)) tagsArr = tags;
    else if (typeof tags === 'string') tagsArr = [tags];
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: 'image'
      }));
    }
    if (!title || !body) {
      return res.status(400).json({ message: 'title and body are required.' });
    }
    const thread = new DiscussionThread({
      title,
      body,
      tags: tagsArr,
      createdBy: req.user._id,
      createdByModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      images,
      posts: [],
      votes: []
    });
    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all threads
export const getThreads = async (req, res) => {
  try {
    console.time('getThreads');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const threads = await DiscussionThread.find({}, {
      title: 1, body: 1, tags: 1, createdBy: 1, createdByModel: 1, createdAt: 1, posts: 1, votes: 1, images: 1
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    for (const thread of threads) {
      thread.createdBy = await getUserInfo(thread.createdBy, thread.createdByModel);
      if (thread.posts && thread.posts.length > 0) {
        for (const post of thread.posts) {
          post.createdBy = await getUserInfo(post.createdBy, post.createdByModel);
        }
      }
    }
    console.timeEnd('getThreads');
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single thread with posts
export const getThread = async (req, res) => {
  try {
    console.time('getThread');
    const { threadId } = req.params;
    const thread = await DiscussionThread.findById(threadId, {
      title: 1, body: 1, tags: 1, createdBy: 1, createdByModel: 1, createdAt: 1, posts: 1, votes: 1, images: 1
    }).lean();
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    thread.createdBy = await getUserInfo(thread.createdBy, thread.createdByModel);
    if (thread.posts && thread.posts.length > 0) {
      for (const post of thread.posts) {
        post.createdBy = await getUserInfo(post.createdBy, post.createdByModel);
      }
    }
    console.timeEnd('getThread');
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add post to thread
export const addPost = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { body, parentPost } = req.body;
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: 'image'
      }));
    }
    if (!body) {
      return res.status(400).json({ message: 'body is required.' });
    }
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    const newPost = {
      body,
      createdBy: req.user._id,
      createdByModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
      parentPost: parentPost || null,
      votes: [],
      images,
      createdAt: new Date()
    };
    thread.posts.push(newPost);
    await thread.save();
    // Notify parent post creator if not the replier
    if (parentPost) {
      const parent = thread.posts.id(parentPost);
      if (parent && parent.createdBy && parent.createdByModel && req.user._id.toString() !== parent.createdBy.toString()) {
        await DiscussionNotification.create({
          user: parent.createdBy,
          userModel: parent.createdByModel,
          type: 'reply',
          thread: thread._id,
          post: parent._id,
          isRead: false
        });
      }
    }
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote on thread
export const voteThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { value } = req.body;
    
    if (![1, 0, -1].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Remove existing vote by this user
    thread.votes = thread.votes.filter(vote => !(vote.user.toString() === req.user._id.toString() && vote.userModel === req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)));
    
    // Add new vote if not 0
    if (value !== 0) {
      thread.votes.push({
        user: req.user._id,
        userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
        value
      });
    }

    await thread.save();
    // Notify thread creator if not the voter and value is not 0
    if (value !== 0 && thread.createdBy && thread.createdByModel && req.user._id.toString() !== thread.createdBy.toString()) {
      await DiscussionNotification.create({
        user: thread.createdBy,
        userModel: thread.createdByModel,
        type: 'vote',
        thread: thread._id,
        post: null,
        isRead: false
      });
    }
    res.json({ message: 'Vote recorded' });
  } catch (err) {
    console.error('VoteThread error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Vote on post
export const votePost = async (req, res) => {
  try {
    const { threadId, postId } = req.params;
    const { value } = req.body;
    
    if (![1, 0, -1].includes(value)) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }

    const thread = await DiscussionThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const post = thread.posts.id(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove existing vote by this user
    post.votes = post.votes.filter(vote => !(vote.user.toString() === req.user._id.toString() && vote.userModel === req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)));
    
    // Add new vote if not 0
    if (value !== 0) {
      post.votes.push({
        user: req.user._id,
        userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
        value
      });
    }

    await thread.save();
    // Notify post creator if not the voter and value is not 0
    if (value !== 0 && post.createdBy && post.createdByModel && req.user._id.toString() !== post.createdBy.toString()) {
      await DiscussionNotification.create({
        user: post.createdBy,
        userModel: post.createdByModel,
        type: 'vote',
        thread: thread._id,
        post: post._id,
        isRead: false
      });
    }
    res.json({ message: 'Vote recorded' });
  } catch (err) {
    console.error('VotePost error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Edit thread
export const editThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.createdBy.toString() !== req.user._id.toString() || thread.createdByModel !== req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { title, body, tags, removeImages } = req.body;
    if (title) thread.title = title;
    if (body) thread.body = body;
    if (tags) thread.tags = Array.isArray(tags) ? tags : [tags];
    // Remove images by index
    if (removeImages && Array.isArray(removeImages)) {
      removeImages.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < thread.images.length) thread.images.splice(idx, 1);
      });
    }
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: 'image'
      }));
      thread.images = [...thread.images, ...newImages];
    }
    thread.edited = true;
    thread.editedAt = new Date();
    await thread.save();
    res.json({ message: 'Thread updated', thread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete thread (soft delete)
export const deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.createdBy.toString() !== req.user._id.toString() || thread.createdByModel !== req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    thread.deleted = true;
    thread.deletedAt = new Date();
    thread.createdBy = null;
    thread.createdByModel = null;
    await thread.save();
    res.json({ message: 'Thread deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit post
export const editPost = async (req, res) => {
  try {
    const { threadId, postId } = req.params;
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    const post = thread.posts.id(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.createdBy.toString() !== req.user._id.toString() || post.createdByModel !== req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { body, removeImages } = req.body;
    if (body) post.body = body;
    // Remove images by index
    if (removeImages && Array.isArray(removeImages)) {
      removeImages.sort((a, b) => b - a).forEach(idx => {
        if (idx >= 0 && idx < post.images.length) post.images.splice(idx, 1);
      });
    }
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        data: f.buffer,
        contentType: f.mimetype,
        fileType: 'image'
      }));
      post.images = [...post.images, ...newImages];
    }
    post.edited = true;
    post.editedAt = new Date();
    await thread.save();
    res.json({ message: 'Post updated', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete post (soft delete)
export const deletePost = async (req, res) => {
  try {
    const { threadId, postId } = req.params;
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    const post = thread.posts.id(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.createdBy.toString() !== req.user._id.toString() || post.createdByModel !== req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    post.deleted = true;
    post.deletedAt = new Date();
    post.body = 'This message was deleted.';
    post.images = [];
    await thread.save();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Discussion Notification Controller Functions ---
// Get notifications for current user
export const getDiscussionNotifications = async (req, res) => {
  try {
    console.time('getDiscussionNotifications');
    const notifications = await DiscussionNotification.find({
      user: req.user._id,
      userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)
    })
      .sort({ createdAt: -1 })
      .populate('thread', 'title')
      .populate('post', 'body');
    console.timeEnd('getDiscussionNotifications');
    res.json(notifications);
  } catch (err) {
    console.error('GetDiscussionNotifications error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Mark notification as read
export const markDiscussionNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await DiscussionNotification.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
        userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)
      },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
export const deleteDiscussionNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await DiscussionNotification.findOneAndDelete({
      _id: id,
      user: req.user._id,
      userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 