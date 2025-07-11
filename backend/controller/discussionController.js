import DiscussionThread from '../models/discussion/DiscussionThread.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';
import multer from 'multer';
import DiscussionNotification from '../models/discussion/DiscussionNotification.js';
import DiscussionPost from '../models/discussion/DiscussionPost.js';

// Utility function to batch fetch user information
const batchGetUserInfo = async (userIds, userModelMap) => {
  if (userIds.size === 0) return new Map();

  console.time('batchGetUserInfo-total');
  const userIdArray = Array.from(userIds);
  
  // Group users by model for efficient batch queries
  const usersByModel = new Map();
  userIdArray.forEach(userId => {
    const model = userModelMap.get(userId);
    if (model) {
      if (!usersByModel.has(model)) {
        usersByModel.set(model, []);
      }
      usersByModel.get(model).push(userId);
    }
  });

  console.time('batchGetUserInfo-queries');
  // Fetch users from each model in parallel
  const userPromises = Array.from(usersByModel.entries()).map(async ([model, ids]) => {
    console.time(`fetch-${model}-users`);
    let userModel;
    switch (model) {
      case 'Student': userModel = Student; break;
      case 'Teacher': userModel = Teacher; break;
      case 'Guardian': userModel = Guardian; break;
      case 'Admin': userModel = Admin; break;
      default: return [];
    }

    const users = await userModel.find(
      { _id: { $in: ids } },
      { email: 1, name: 1, _id: 1 }
    ).lean();
    console.timeEnd(`fetch-${model}-users`);

    return users.map(user => ({
      id: user._id.toString(),
      email: user.email || 'Unknown',
      name: user.name || '',
      role: model
    }));
  });

  const allUsers = await Promise.all(userPromises);
  console.timeEnd('batchGetUserInfo-queries');

  console.time('batchGetUserInfo-mapping');
  const userInfoMap = new Map();
  allUsers.flat().forEach(user => {
    userInfoMap.set(user.id, {
      email: user.email,
      name: user.name,
      role: user.role
    });
  });
  console.timeEnd('batchGetUserInfo-mapping');
  console.timeEnd('batchGetUserInfo-total');

  return userInfoMap;
};

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

// Utility to normalize user model string
function normalizeUserModel(role) {
  if (!role) return 'Student';
  const r = role.toLowerCase();
  if (r === 'student') return 'Student';
  if (r === 'teacher') return 'Teacher';
  if (r === 'guardian') return 'Guardian';
  if (r === 'admin') return 'Admin';
  return 'Student';
}

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
      createdByModel: normalizeUserModel(req.user.role),
      images,
      posts: [],
      votes: []
    });
    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    console.error(err);
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

    console.time('fetch-threads');
    // Get threads with basic info
    const threads = await DiscussionThread.find({}, {
      title: 1, body: 1, tags: 1, createdBy: 1, createdByModel: 1, createdAt: 1, posts: 1, votes: 1
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    console.timeEnd('fetch-threads');

    console.time('collect-user-ids');
    // Collect all user IDs for batch processing
    const userIds = new Set();
    const userModelMap = new Map(); // Map userId to model

    // Collect thread creators
    threads.forEach(thread => {
      if (thread.createdBy) {
        userIds.add(thread.createdBy.toString());
        userModelMap.set(thread.createdBy.toString(), thread.createdByModel);
      }
    });

    // Collect post creators
    threads.forEach(thread => {
      if (thread.posts && thread.posts.length > 0) {
        thread.posts.forEach(post => {
          if (post.createdBy) {
            userIds.add(post.createdBy.toString());
            userModelMap.set(post.createdBy.toString(), post.createdByModel);
          }
        });
      }
    });
    console.timeEnd('collect-user-ids');

    console.time('batch-fetch-users');
    // Batch fetch all user information
    const userInfoMap = await batchGetUserInfo(userIds, userModelMap);
    console.timeEnd('batch-fetch-users');

    console.time('apply-user-info');
    // Apply user info to threads and posts
    threads.forEach(thread => {
      if (thread.createdBy) {
        const userId = thread.createdBy.toString();
        thread.createdBy = userInfoMap.get(userId) || { email: 'Unknown', name: '', role: thread.createdByModel };
      }

      if (thread.posts && thread.posts.length > 0) {
        thread.posts.forEach(post => {
          if (post.createdBy) {
            const userId = post.createdBy.toString();
            post.createdBy = userInfoMap.get(userId) || { email: 'Unknown', name: '', role: post.createdByModel };
          }
        });
      }
    });
    console.timeEnd('apply-user-info');

    console.timeEnd('getThreads');
    res.json(threads);
  } catch (err) {
    console.error('getThreads error:', err);
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

    // Collect all user IDs for batch processing
    const userIds = new Set();
    const userModelMap = new Map();

    // Collect thread creator
    if (thread.createdBy) {
      userIds.add(thread.createdBy.toString());
      userModelMap.set(thread.createdBy.toString(), thread.createdByModel);
    }

    // Collect post creators
    if (thread.posts && thread.posts.length > 0) {
      thread.posts.forEach(post => {
        if (post.createdBy) {
          userIds.add(post.createdBy.toString());
          userModelMap.set(post.createdBy.toString(), post.createdByModel);
        }
      });
    }

    // Batch fetch all user information
    const userInfoMap = await batchGetUserInfo(userIds, userModelMap);

    // Apply user info to thread and posts
    if (thread.createdBy) {
      const userId = thread.createdBy.toString();
      thread.createdBy = userInfoMap.get(userId) || { email: 'Unknown', name: '', role: thread.createdByModel };
    }

    if (thread.posts && thread.posts.length > 0) {
      thread.posts.forEach(post => {
        if (post.createdBy) {
          const userId = post.createdBy.toString();
          post.createdBy = userInfoMap.get(userId) || { email: 'Unknown', name: '', role: post.createdByModel };
        }
      });
    }

    console.timeEnd('getThread');
    res.json(thread);
  } catch (err) {
    console.error('getThread error:', err);
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
    const model = normalizeUserModel(req.user.role);
    const newPost = {
      body,
      createdBy: req.user._id,
      createdByModel: model,
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
    const model = normalizeUserModel(req.user.role);
    thread.votes = thread.votes.filter(vote => !(vote.user.toString() === req.user._id.toString() && vote.userModel === model));
    if (value !== 0) {
      thread.votes.push({
        user: req.user._id,
        userModel: model,
        value
      });
    }
    await thread.save();
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
    // Return updated votes array
    res.json({ message: 'Vote recorded', votes: thread.votes });
  } catch (err) {
    console.error('VoteThread error:', err, err.stack);
    res.status(500).json({ message: err.message, stack: err.stack });
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
    const model = normalizeUserModel(req.user.role);
    const userId = req.user._id;
    const userModel = model;
    const thread = await DiscussionThread.findOne({ _id: threadId, 'posts._id': postId }, { 'posts.$': 1 });
    if (!thread || !thread.posts || thread.posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = thread.posts[0];
    const existingVote = post.votes.find(v => v.user.toString() === userId.toString() && v.userModel === userModel);
    let newVotes;
    if (existingVote) {
      if (existingVote.value === value) {
        newVotes = post.votes.filter(v => !(v.user.toString() === userId.toString() && v.userModel === userModel));
      } else {
        newVotes = post.votes.map(v =>
          v.user.toString() === userId.toString() && v.userModel === userModel ? { ...v, value } : v
        );
      }
    } else {
      newVotes = [...post.votes, { user: userId, userModel, value }];
    }
    await DiscussionThread.updateOne(
      { _id: threadId, 'posts._id': postId },
      { $set: { 'posts.$.votes': newVotes } }
    );
    // Fetch the updated post votes
    const updatedThread = await DiscussionThread.findOne({ _id: threadId, 'posts._id': postId }, { 'posts.$': 1 });
    res.json({ message: 'Vote recorded', votes: updatedThread.posts[0].votes });
  } catch (err) {
    console.error('VotePost error:', err, err.stack);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

// Edit thread
export const editThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await DiscussionThread.findById(threadId);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.createdBy.toString() !== req.user._id.toString() || thread.createdByModel !== normalizeUserModel(req.user.role)) {
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
    if (thread.createdBy.toString() !== req.user._id.toString() || thread.createdByModel !== normalizeUserModel(req.user.role)) {
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
    if (post.createdBy.toString() !== req.user._id.toString() || post.createdByModel !== normalizeUserModel(req.user.role)) {
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
    if (post.createdBy.toString() !== req.user._id.toString() || post.createdByModel !== normalizeUserModel(req.user.role)) {
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
    const model = normalizeUserModel(req.user.role);
    const notifications = await DiscussionNotification.find({
      user: req.user._id,
      userModel: model
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
    const model = normalizeUserModel(req.user.role);
    const notification = await DiscussionNotification.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
        userModel: model
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
    const model = normalizeUserModel(req.user.role);
    const notification = await DiscussionNotification.findOneAndDelete({
      _id: id,
      user: req.user._id,
      userModel: model
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search posts by heading (title)
export const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Query is required' });
    }
    // Search for posts with a title matching the query (case-insensitive)
    const threads = await DiscussionThread.find({
      title: { $regex: query, $options: 'i' }
    }, {
      _id: 1,
      title: 1,
      createdBy: 1,
      createdAt: 1,
      tags: 1,
      posts: 1
    }).lean();
    // Return only threadId, title, and metadata
    const results = threads.map(thread => ({
      threadId: thread._id,
      title: thread.title,
      createdBy: thread.createdBy,
      createdAt: thread.createdAt,
      tags: thread.tags,
      postCount: thread.posts?.length || 0
    }));
    res.json(results);
  } catch (err) {
    console.error('searchPosts error:', err, err.stack);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
}; 