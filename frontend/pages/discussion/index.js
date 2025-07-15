import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  createDiscussionThread, 
  fetchDiscussionThreads, 
  fetchDiscussionThread,
  addDiscussionPost,
  voteThread,
  votePost,
  editDiscussionPost,
  deleteDiscussionPost,
  searchDiscussionThreads
} from '../../service/api';
import { getToken } from '../../utils/auth.js';

// Helper to build a tree from flat posts array, sorted by upvotes
function buildPostTree(posts) {
  const idToNode = {};
  const roots = [];
  (Array.isArray(posts) ? posts : []).forEach(post => {
    idToNode[post._id] = { ...post, replies: [] };
  });
  (Array.isArray(posts) ? posts : []).forEach(post => {
    if (post.parentPost) {
      if (idToNode[post.parentPost]) {
        idToNode[post.parentPost].replies.push(idToNode[post._id]);
      }
    } else {
      roots.push(idToNode[post._id]);
    }
  });
  // Sort replies at each level by upvotes
  function sortReplies(node) {
    if (Array.isArray(node.replies) && node.replies.length > 0) {
      node.replies.sort((a, b) => {
        const aVotes = (a.votes || []).reduce((sum, v) => sum + v.value, 0);
        const bVotes = (b.votes || []).reduce((sum, v) => sum + v.value, 0);
        return bVotes - aVotes;
      });
      node.replies.forEach(sortReplies);
    }
  }
  roots.sort((a, b) => {
    const aVotes = (a.votes || []).reduce((sum, v) => sum + v.value, 0);
    const bVotes = (b.votes || []).reduce((sum, v) => sum + v.value, 0);
    return bVotes - aVotes;
  });
  roots.forEach(sortReplies);
  return roots;
}

function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { _id: payload.userId, role: payload.role.charAt(0).toUpperCase() + payload.role.slice(1) };
  } catch {
    return null;
  }
}

function PostTree({ post, onReply, onVote, getVoteCount, getUserVote, replyingTo, setReplyingTo, replyBody, setReplyBody, replyBodyByPostId, setReplyBodyByPostId, replyImagesByPostId, setReplyImagesByPostId, currentUser, onEdit, onDelete, setImagePreview, highlightId }) {
  const [highlight, setHighlight] = React.useState(false);
  const postRef = React.useRef();
  React.useEffect(() => {
    if (highlightId && post._id === highlightId) {
      setHighlight(true);
      postRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timeout = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [highlightId, post._id]);
  // Fix: handle both populated and unpopulated createdBy, and check for role match if available
  let isCreator = false;
  if (currentUser && post.createdBy) {
    const postCreatorId = typeof post.createdBy === 'object' ? post.createdBy._id : post.createdBy;
    isCreator = String(postCreatorId) === String(currentUser._id);
  }
  // Show visually if this post is by the current user
  const isPostCreator = currentUser && post.createdBy &&
    (String(post.createdBy._id || post.createdBy) === String(currentUser._id));
  return (
    <div ref={postRef} style={{ marginLeft: post.parentPost ? 32 : 0, borderLeft: post.parentPost ? '2px solid #e0e0e0' : 'none', paddingLeft: 16, position: 'relative', background: highlight ? '#fff9c4' : isCreator ? '#f0f8ff' : '#fff', transition: 'background 0.3s' }}>
      <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, background: 'inherit', marginBottom: 8 }}>
        <p style={{ color: '#333', marginBottom: 12, lineHeight: 1.5 }}>
          {post.body}
          {post.edited && <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>(edited)</span>}
        </p>
        {/* Show images if present */}
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url || `data:${img.contentType};base64,${img.data}`}
                alt={`Post Image ${idx + 1}`}
                style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: '1px solid #eee', cursor: 'pointer' }}
                onClick={() => setImagePreview && setImagePreview({ open: true, src: img.url || `data:${img.contentType};base64,${img.data}` })}
              />
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#888' }}>
            By: {post.createdBy?.name || post.createdBy?.email || 'Unknown'}{isCreator && <span style={{ color: '#0079d3', fontWeight: 600 }}> (You)</span>} ({post.createdBy?.role || 'User'})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => onVote(post._id, 1)}
              style={{
                background: getUserVote(post.votes, currentUser?._id, currentUser?.role) === 1 ? 'rgba(255,69,0,0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 22,
                color: getUserVote(post.votes, currentUser?._id, currentUser?.role) === 1 ? '#ff4500' : '#888',
                fontWeight: getUserVote(post.votes, currentUser?._id, currentUser?.role) === 1 ? 700 : 400,
                borderRadius: 4,
                padding: '2px 6px',
                transition: 'background 0.2s, color 0.2s',
              }}
              aria-label="Upvote"
            >▲</button>
            <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{getVoteCount(post.votes)}</span>
            <button
              onClick={() => onVote(post._id, -1)}
              style={{
                background: getUserVote(post.votes, currentUser?._id, currentUser?.role) === -1 ? 'rgba(113,147,255,0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 22,
                color: getUserVote(post.votes, currentUser?._id, currentUser?.role) === -1 ? '#7193ff' : '#888',
                fontWeight: getUserVote(post.votes, currentUser?._id, currentUser?.role) === -1 ? 700 : 400,
                borderRadius: 4,
                padding: '2px 6px',
                transition: 'background 0.2s, color 0.2s',
              }}
              aria-label="Downvote"
            >▼</button>
            <button onClick={() => setReplyingTo(post._id)} style={{ marginLeft: 12, fontSize: 14, color: '#0079d3', background: 'none', border: 'none', cursor: 'pointer' }}>Reply</button>
            {/* Always show for debug: */}
            {isCreator && !post.deleted && (
              <>
                <button onClick={() => onEdit(post)} style={{ marginLeft: 12, fontSize: 14, color: '#1e3c72', background: 'none', border: '1px solid #1e3c72', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => onDelete(post)} style={{ marginLeft: 8, fontSize: 14, color: '#c0392b', background: 'none', border: '1px solid #c0392b', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
              </>
            )}
          </div>
        </div>
        {post.deleted && (
          <div style={{ color: '#c0392b', fontStyle: 'italic', marginTop: 8 }}>This message was deleted.</div>
        )}
        {replyingTo === post._id && (
          <ReplyForm
            onSubmit={(e, files) => { e.preventDefault(); onReply(post._id, replyBody, files); }}
            value={replyBody}
            onChange={setReplyBody}
            onCancel={() => { setReplyingTo(null); setReplyBody(''); setReplyImagesByPostId(prev => ({ ...prev, [post._id]: [] })); }}
            images={replyImagesByPostId?.[post._id] || []}
            setImages={imgs => setReplyImagesByPostId(prev => ({ ...prev, [post._id]: imgs }))}
            setImagePreview={setImagePreview}
          />
        )}
      </div>
      {Array.isArray(post.replies) && post.replies.length > 0 && (
        <div style={{ marginLeft: 0 }}>
          {post.replies.map(child => (
            <PostTree
              key={child._id}
              post={child}
              onReply={onReply}
              onVote={onVote}
              getVoteCount={getVoteCount}
              getUserVote={getUserVote}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBodyByPostId={replyBodyByPostId}
              setReplyBodyByPostId={setReplyBodyByPostId}
              replyBody={replyBodyByPostId[child._id] || ''}
              setReplyBody={body => setReplyBodyByPostId(prev => ({ ...prev, [child._id]: body }))}
              replyImagesByPostId={replyImagesByPostId}
              setReplyImagesByPostId={setReplyImagesByPostId}
              currentUser={currentUser}
              onEdit={onEdit}
              onDelete={onDelete}
              setImagePreview={setImagePreview}
              highlightId={highlightId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyForm({ onSubmit, value, onChange, onCancel, images = [], setImages, setImagePreview }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages && setImages(files);
  };
  return (
    <form onSubmit={e => onSubmit(e, images)} style={{ marginTop: 12 }} encType="multipart/form-data">
      <textarea
        placeholder="Write your reply..."
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={2}
        style={{ width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ddd', height: 80, resize: 'none' }}
      />
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ display: 'inline-block', background: '#eee', color: '#333', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>
          Upload Photo
          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
        </label>
        {images && images.length > 0 && (
          <span style={{ fontSize: 13, color: '#888' }}>{images.length} image(s) selected</span>
        )}
        <button type="submit" style={{ padding: '6px 14px', fontSize: 13, borderRadius: 6, background: '#0079d3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Post</button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 6, background: '#eee', color: '#333', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        )}
      </div>
      {/* Preview selected images */}
      {images && images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {images.map((file, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt={`Preview ${idx + 1}`}
              style={{ maxWidth: 80, maxHeight: 60, borderRadius: 6, border: '1px solid #eee', cursor: 'pointer' }}
              onClick={() => setImagePreview && setImagePreview({ open: true, src: URL.createObjectURL(file) })}
            />
          ))}
        </div>
      )}
    </form>
  );
}

export default function DiscussionPanel() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [mainReplyBody, setMainReplyBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  // Per-post reply input state for nested replies
  const [replyBodyByPostId, setReplyBodyByPostId] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagFilter, setTagFilter] = useState([]);
  const [mainReplyImages, setMainReplyImages] = useState([]);
  const [nestedReplyImages, setNestedReplyImages] = useState([]);
  const [threadImages, setThreadImages] = useState([]);
  const [replyImagesByPostId, setReplyImagesByPostId] = useState({});
  const [editPostModal, setEditPostModal] = useState({ open: false, post: null });
  const [editPostBody, setEditPostBody] = useState('');
  const [editPostImages, setEditPostImages] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, post: null });
  const [imagePreview, setImagePreview] = useState({ open: false, src: '' });
  const router = useRouter();
  const currentUser = getCurrentUser();
  const searchParams = useSearchParams();
  const highlightPostId = searchParams.get('post');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [pendingThreadVote, setPendingThreadVote] = useState(null);
  const [pendingPostVote, setPendingPostVote] = useState(null);
  const [hoveredThreadId, setHoveredThreadId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Tag options (deduplicated and cleaned up)
  const TAG_OPTIONS = [
    'CBSE', 'Maths', 'Chemistry', 'Physics', 'Science', 'JEE', 'NEET', 'Biology', 'English', 'Hindi', 'Social Studies',
    'History', 'Geography', 'Civics', 'Economics', 'Political Science', 'Philosophy', 'Religion', 'Art', 'Music', 'Dance',
    'Theatre', 'Film', 'Literature', 'Language', 'Communication', 'Public Speaking', 'Leadership', 'Management',
    'Entrepreneurship', 'Marketing', 'Sales', 'Customer Service', 'HR', 'Finance', 'Accounting', 'Taxation', 'Law',
    'Criminal Justice', 'Social Work', 'Psychology', 'Sociology', 'Anthropology'
  ];

  // Tag dropdown and search state
  const [tagSelectDropdownOpen, setTagSelectDropdownOpen] = useState(false);
  const [tagSelectSearch, setTagSelectSearch] = useState('');
  const [tagFilterDropdownOpen, setTagFilterDropdownOpen] = useState(false);
  const [tagFilterSearch, setTagFilterSearch] = useState('');
  const tagSelectRef = useRef(null);
  const tagFilterRef = useRef(null);

  // Filtered tag options based on search
  const filteredTagSelectOptions = TAG_OPTIONS.filter(tag =>
    tag.toLowerCase().includes(tagSelectSearch.toLowerCase())
  );
  const filteredTagFilterOptions = TAG_OPTIONS.filter(tag =>
    tag.toLowerCase().includes(tagFilterSearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (tagSelectRef.current && !tagSelectRef.current.contains(event.target)) {
        setTagSelectDropdownOpen(false);
      }
      if (tagFilterRef.current && !tagFilterRef.current.contains(event.target)) {
        setTagFilterDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchThreads(1);
    setPage(1);
  }, []);

  useEffect(() => {
    const threadId = searchParams.get('thread');
    if (threadId) {
      handleViewThread(threadId);
    }
  }, [searchParams]);

  const fetchThreads = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchDiscussionThreads(pageNum, 20);
      if (pageNum === 1) {
        setThreads(res.data);
      } else {
        setThreads(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length === 20);
    } catch (err) {
      setError('Failed to load threads');
    }
    setLoading(false);
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !body) {
      setError('Title and body are required.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      tags.forEach(tag => formData.append('tags[]', tag));
      if (threadImages.length === 0) {
        // Always append an empty images field if no images selected
        formData.append('images', '');
      } else {
        threadImages.forEach(file => formData.append('images', file));
      }
      const token = localStorage.getItem('token');
      await createDiscussionThread(formData, token);
      setTitle('');
      setBody('');
      setTags([]);
      setThreadImages([]);
      fetchThreads();
    } catch (err) {
      setError('Failed to create thread');
    }
  };

  const handleViewThread = async (threadId) => {
    try {
      const res = await fetchDiscussionThread(threadId);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to load thread');
    }
  };

  const handleMainReply = async (e) => {
    e.preventDefault();
    if (!mainReplyBody.trim()) return;
    try {
      const formData = new FormData();
      formData.append('body', mainReplyBody);
      formData.append('parentPost', '');
      mainReplyImages.forEach((file) => formData.append('images', file));
      await addDiscussionPost(selectedThread._id, formData);
      setMainReplyBody('');
      setMainReplyImages([]);
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to add reply');
    }
  };

  const handleNestedReply = async (parentPostId, body, files) => {
    if (!body.trim()) return;
    try {
      const formData = new FormData();
      formData.append('body', body);
      formData.append('parentPost', parentPostId);
      (files || []).forEach((file) => formData.append('images', file));
      await addDiscussionPost(selectedThread._id, formData);
      setReplyBodyByPostId(prev => ({ ...prev, [parentPostId]: '' }));
      setReplyingTo(null);
      setReplyImagesByPostId(prev => ({ ...prev, [parentPostId]: [] }));
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to add reply');
    }
  };

  const handleVoteThread = async (threadId, value) => {
    setPendingThreadVote(threadId);
    const token = getToken();
    const thread = threads.find(t => t._id === threadId);
    const userId = currentUser?._id;
    const userRole = currentUser?.role;
    const currentVote = thread?.votes?.find(v => v.user === userId && v.userModel === userRole);

    let newValue = value;
    if (currentVote && currentVote.value === value) {
      newValue = 0; // toggle off
    }

    // Track the intended vote for this user
    const intendedVote = newValue;

    // Optimistically update UI
    setThreads(prev => prev.map(t => {
      if (t._id !== threadId) return t;
      let newVotes = t.votes.filter(v => !(v.user === userId && v.userModel === userRole));
      if (newValue !== 0) newVotes.push({ user: userId, userModel: userRole, value: newValue });
      return { ...t, votes: newVotes };
    }));

    try {
      await voteThread(threadId, newValue, token);
      // Fetch latest thread data in background
      // fetchDiscussionThread(threadId).then(res => {
      //   // Only update if backend vote matches intended vote
      //   const backendVote = res.data.votes.find(v => v.user === userId && v.userModel === userRole)?.value || 0;
      //   if (backendVote === intendedVote) {
      //     setThreads(prev => prev.map(t => t._id === threadId ? { ...t, ...res.data } : t));
      //     if (selectedThread && selectedThread._id === threadId) {
      //       setSelectedThread(res.data);
      //     }
      //   }
      //   // else: ignore backend response, user has already changed vote again
      // });
      // Fetch latest thread data but only apply if backend vote matches the user’s last action
      fetchDiscussionThread(threadId).then(res => {
        const backendVoteObj = res.data.votes.find(v =>
          v.user === userId && v.userModel === userRole
        );
        const backendVote = backendVoteObj ? backendVoteObj.value : 0;
        if (backendVote === intendedVote) {
          setThreads(prev => prev.map(t =>
            t._id === threadId ? { ...t, ...res.data } : t
          ));
          if (selectedThread?._id === threadId) {
            setSelectedThread(res.data);
          }
        }
      });
    } catch (err) {
      setError('Vote failed. Please try again.');
    } finally {
      setPendingThreadVote(null);
    }
  };

  const handleVotePost = async (postId, value) => {
    setPendingPostVote(postId);
    const token = getToken();
    const post = selectedThread.posts.find(p => p._id === postId);
    const userId = currentUser?._id;
    const userRole = currentUser?.role;
    const currentVote = post && post.votes ? post.votes.find(v => v.user === userId && v.userModel === userRole) : null;

    let newValue = value;
    if (currentVote && currentVote.value === value) {
      newValue = 0; // toggle off
    }

    // Track the intended vote for this user
    const intendedVote = newValue;

    // Optimistically update UI
    setSelectedThread(prev => ({
      ...prev,
      posts: prev.posts.map(p => {
        if (p._id !== postId) return p;
        let newVotes = p.votes.filter(v => !(v.user === userId && v.userModel === userRole));
        if (newValue !== 0) newVotes.push({ user: userId, userModel: userRole, value: newValue });
        return { ...p, votes: newVotes };
      })
    }));

    try {
      await votePost(selectedThread._id, postId, newValue, token);
      // Fetch latest post data in background
      // fetchDiscussionThread(selectedThread._id).then(res => {
      //   // Only update if backend vote matches intended vote
      //   const backendPost = res.data.posts.find(p => p._id === postId);
      //   const backendVote = backendPost?.votes.find(v => v.user === userId && v.userModel === userRole)?.value || 0;
      //   if (backendVote === intendedVote) {
      //     setSelectedThread(res.data);
      //   }
      //   // else: ignore backend response, user has already changed vote again
      // });
            // Fetch latest post data but only apply if backend vote matches the user’s last action
     fetchDiscussionThread(selectedThread._id).then(res => {
           const backendPost = res.data.posts.find(p => p._id === postId);
           const backendVoteObj = backendPost?.votes?.find(v =>
              v.user === userId && v.userModel === userRole
                 );
            const backendVote = backendVoteObj ? backendVoteObj.value : 0;
          if (backendVote === intendedVote) {
           setSelectedThread(res.data);
              }
           });
    } catch (err) {
      setError('Vote failed. Please try again.');
    } finally {
      setPendingPostVote(null);
    }
  };

  const getVoteCount = (votes) => {
    if (!Array.isArray(votes)) return 0;
    return votes.reduce((sum, vote) => sum + vote.value, 0);
  };

  const getUserVote = (votes, userId, userRole) => {
    if (!Array.isArray(votes)) return 0;
    const vote = votes.find(v => v.user === userId && v.userModel === userRole);
    return vote ? vote.value : 0;
  };

  // Add filter state
  const [activeTab, setActiveTab] = useState('hot'); // 'hot' | 'latest'
  // Remove old tagFilter state, use selectedTags for categories filter
  const [selectedTags, setSelectedTags] = useState([]);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const categoriesDropdownRef = useRef(null);

  // Handle click outside for categories dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setCategoriesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtering and sorting logic
  const getThreadUpvotes = (thread) => (thread.votes || []).reduce((sum, v) => sum + v.value, 0);
  let filteredThreads = threads;
  if (selectedTags.length > 0) {
    filteredThreads = filteredThreads.filter(thread => thread.tags && selectedTags.some(tag => thread.tags.includes(tag)));
  }
  if (activeTab === 'hot') {
    filteredThreads = filteredThreads.slice().sort((a, b) => getThreadUpvotes(b) - getThreadUpvotes(a));
  } else if (activeTab === 'latest') {
    filteredThreads = filteredThreads.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Edit post handler
  const handleEditPost = (post) => {
    setEditPostModal({ open: true, post });
    setEditPostBody(post.body);
    setEditPostImages([]); // For new images
  };

  // Delete post handler
  const handleDeletePost = (post) => {
    setDeleteConfirm({ open: true, post });
  };

  // Confirm delete
  const confirmDeletePost = async () => {
    if (!deleteConfirm.post) return;
    try {
      const token = localStorage.getItem('token');
      await deleteDiscussionPost(selectedThread._id, deleteConfirm.post._id, token);
      setDeleteConfirm({ open: false, post: null });
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  // Save edit
  const saveEditPost = async (e) => {
    e.preventDefault();
    if (!editPostModal.post) return;
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('body', editPostBody);
      editPostImages.forEach(file => formData.append('images', file));
      await editDiscussionPost(selectedThread._id, editPostModal.post._id, formData, token);
      setEditPostModal({ open: false, post: null });
      setEditPostBody('');
      setEditPostImages([]);
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to edit post');
    }
  };

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchThreads(nextPage);
    }
  }, [hasMore, loading, page]);

  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 1.0 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => { if (loader.current) observer.unobserve(loader.current); };
  }, [handleObserver]);

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await searchDiscussionThreads(searchQuery.trim());
      setSearchResults(res.data || []);
    } catch (err) {
      setSearchError('Failed to search.');
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // --- Reusable Style Objects ---
  const fontFamily = 'Arial, sans-serif';
  const cardStyle = {
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 8px #e6e6e6',
    border: '1px solid #eee',
    marginBottom: 18,
    transition: 'box-shadow 0.2s, transform 0.2s',
    fontFamily,
  };
  const cardHover = {
    boxShadow: '0 6px 24px #e0e0e0',
    transform: 'translateY(-2px)',
  };
  const votingBarStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
    background: '#fafbfc',
    borderRight: '1px solid #f0f0f0',
    borderRadius: '10px 0 0 10px',
    padding: '10px 0',
    userSelect: 'none',
  };
  const tagPill = (selected) => ({
    background: selected ? '#1e3c72' : '#e0e7ff',
    color: selected ? '#fff' : '#1e3c72',
    fontWeight: 700,
    fontSize: 13,
    borderRadius: 12,
    padding: '2px 12px',
    marginRight: 6,
    marginBottom: 4,
    display: 'inline-block',
    letterSpacing: 0.5,
    border: 'none',
    cursor: 'pointer',
    fontFamily,
  });
  const threadTagPill = {
    background: '#e0e7ff',
    color: '#1e3c72',
    fontWeight: 700,
    fontSize: 12,
    borderRadius: 12,
    padding: '2px 10px',
    marginRight: 6,
    marginBottom: 4,
    display: 'inline-block',
    letterSpacing: 0.5,
    fontFamily,
  };
  const threadCardContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  };
  const threadCard = {
    ...cardStyle,
    display: 'flex',
    alignItems: 'stretch',
    minHeight: 90,
    cursor: 'pointer',
    fontFamily,
  };
  const threadCardVoting = {
    ...votingBarStyle,
  };
  const threadCardInfo = {
    flex: 1,
    padding: '18px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  };
  const threadMetaRow = {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontFamily,
  };
  const titleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: '#222',
    marginBottom: 6,
    fontFamily,
    lineHeight: 1.2,
  };
  const snippetStyle = {
    color: '#555',
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 1.5,
    fontFamily,
  };
  const verticalButton = (active, color) => ({
    background: active ? (color === '#ff4500' ? 'rgba(255,69,0,0.10)' : 'rgba(113,147,255,0.10)') : 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 26,
    color: active ? color : '#bbb',
    fontWeight: active ? 700 : 400,
    borderRadius: 5,
    padding: '2px 7px',
    margin: 0,
    transition: 'background 0.2s, color 0.2s',
    outline: 'none',
    fontFamily,
  });
  const postFormCard = {
    ...cardStyle,
    padding: 28,
    marginBottom: 32,
  };
  const postFormLabel = {
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 8,
    display: 'block',
    fontFamily,
  };
  const postFormTagRow = {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 12,
  };
  const inputStyle = {
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderRadius: 7,
    border: '1.5px solid #e0e0e0',
    marginBottom: 14,
    fontFamily,
  };
  const textareaStyle = {
    ...inputStyle,
    minHeight: 70,
    resize: 'vertical',
  };
  const blueButton = {
    padding: '10px 28px',
    fontSize: 16,
    borderRadius: 8,
    background: '#0079d3',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
    marginTop: 8,
    marginBottom: 0,
    letterSpacing: 0.5,
  };
  const postFormUpload = {
    display: 'inline-block',
    background: '#eee',
    color: '#333',
    borderRadius: 7,
    padding: '7px 18px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily,
    marginBottom: 8,
  };
  const postFormImagePreview = {
    display: 'flex',
    gap: 10,
    marginTop: 8,
  };
  const postFormError = {
    color: 'red',
    marginTop: 10,
    fontFamily,
    fontWeight: 600,
  };

  if (selectedThread) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <button 
          onClick={() => setSelectedThread(null)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#0079d3', 
            cursor: 'pointer', 
            fontSize: 16, 
            marginBottom: 20 
          }}
        >
          ← Back to Threads
        </button>

        {/* Thread Details */}
        <div style={{ marginBottom: 24, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{selectedThread.title}</h1>
          {/* Show tags */}
          {selectedThread.tags && selectedThread.tags.length > 0 && (
            <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
              {selectedThread.tags.map(tag => (
                <span key={tag} style={{ background: '#e0e7ff', color: '#1e3c72', fontSize: 13, fontWeight: 600, borderRadius: 6, padding: '2px 10px', letterSpacing: 1 }}>{tag}</span>
              ))}
            </div>
          )}
          <p style={{ color: '#666', marginBottom: 16, lineHeight: 1.6 }}>{selectedThread.body}</p>
          {selectedThread.images && selectedThread.images.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              {selectedThread.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url || `data:${img.contentType};base64,${img.data}`}
                  alt={`Thread Image ${idx + 1}`}
                  style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6, border: '1px solid #eee', cursor: 'pointer' }}
                  onClick={() => setImagePreview({ open: true, src: img.url || `data:${img.contentType};base64,${img.data}` })}
                />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#888' }}>
              By: {selectedThread.createdBy?.name || 'Unknown'} ({selectedThread.createdBy?.role || 'User'})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button 
                onClick={() => handleVoteThread(selectedThread._id, 1)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: 20,
                  color: getUserVote(selectedThread.votes, currentUser?._id, currentUser?.role) === 1 ? '#ff4500' : '#888'
                }}
                disabled={pendingThreadVote === selectedThread._id}
              >
                ▲
              </button>
              <span style={{ fontWeight: 600 }}>{getVoteCount(selectedThread.votes)}</span>
              <button 
                onClick={() => handleVoteThread(selectedThread._id, -1)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: 20,
                  color: getUserVote(selectedThread.votes, currentUser?._id, currentUser?.role) === -1 ? '#7193ff' : '#888'
                }}
                disabled={pendingThreadVote === selectedThread._id}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Main Reply Box */}
        <ReplyForm
          onSubmit={handleMainReply}
          value={mainReplyBody}
          onChange={setMainReplyBody}
          images={mainReplyImages}
          setImages={setMainReplyImages}
          setImagePreview={setImagePreview}
        />

        {/* Posts */}
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Replies ({selectedThread.posts.length})</h3>
        {selectedThread.posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>No replies yet. Be the first to reply!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {buildPostTree(selectedThread.posts).map(rootPost => (
              <PostTree
                key={rootPost._id}
                post={rootPost}
                onReply={handleNestedReply}
                onVote={handleVotePost}
                getVoteCount={getVoteCount}
                getUserVote={getUserVote}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyBodyByPostId={replyBodyByPostId}
                setReplyBodyByPostId={setReplyBodyByPostId}
                replyBody={replyBodyByPostId[rootPost._id] || ''}
                setReplyBody={body => setReplyBodyByPostId(prev => ({ ...prev, [rootPost._id]: body }))}
                replyImagesByPostId={replyImagesByPostId}
                setReplyImagesByPostId={setReplyImagesByPostId}
                currentUser={currentUser}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                setImagePreview={setImagePreview}
                highlightId={highlightPostId}
              />
            ))}
          </div>
        )}
        {/* Edit Post Modal */}
        {editPostModal.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditPostModal({ open: false, post: null })}>
            <form onSubmit={saveEditPost} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center', maxWidth: 420 }}>
              <h3 style={{ marginBottom: 18, color: '#1e3c72' }}>Edit Post</h3>
              <textarea value={editPostBody} onChange={e => setEditPostBody(e.target.value)} rows={3} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: '1.5px solid #e0e0e0', fontSize: 16 }} required />
              <input type="file" accept="image/jpeg,image/png,image/jpg" multiple onChange={e => setEditPostImages(Array.from(e.target.files))} style={{ marginBottom: 12 }} />
              <div style={{ marginTop: 10, color: '#1e3c72', fontWeight: 500 }}></div>
              <button type="submit" style={{ background: '#1e3c72', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>Save</button>
              <button type="button" onClick={() => setEditPostModal({ open: false, post: null })} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </form>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', textAlign: 'center', maxWidth: 420 }}>
              <h3 style={{ marginBottom: 18, color: '#c0392b' }}>Delete Post</h3>
              <p>Are you sure you want to delete this post? This action cannot be undone.</p>
              <button onClick={confirmDeletePost} style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', marginRight: 12 }}>Yes, Delete</button>
              <button onClick={() => setDeleteConfirm({ open: false, post: null })} style={{ background: '#bbb', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        {/* Image Preview Modal */}
        {imagePreview.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setImagePreview({ open: false, src: '' })}>
            <img src={imagePreview.src} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 2px 16px #0008' }} alt="Preview" onClick={e => e.stopPropagation()} />
            <button onClick={() => setImagePreview({ open: false, src: '' })} style={{ position: 'absolute', top: 30, right: 40, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 20, fontSize: 28, width: 40, height: 40, cursor: 'pointer' }}>&times;</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, borderBottom: '1px solid #eee', marginBottom: 24, position: 'relative' }}>
        <button
          onClick={() => setActiveTab('latest')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 17,
            fontWeight: 600,
            color: activeTab === 'latest' ? '#222' : '#888',
            borderBottom: activeTab === 'latest' ? '2.5px solid #222' : '2.5px solid transparent',
            padding: '8px 0',
            cursor: 'pointer',
            outline: 'none',
            marginRight: 8,
            transition: 'color 0.2s, border-bottom 0.2s',
          }}
        >
          Latest
        </button>
        <button
          onClick={() => setActiveTab('hot')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 17,
            fontWeight: 600,
            color: activeTab === 'hot' ? '#222' : '#888',
            borderBottom: activeTab === 'hot' ? '2.5px solid #222' : '2.5px solid transparent',
            padding: '8px 0',
            cursor: 'pointer',
            outline: 'none',
            marginRight: 8,
            transition: 'color 0.2s, border-bottom 0.2s',
          }}
        >
          Hot
        </button>
        <div ref={categoriesDropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setCategoriesDropdownOpen(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 17,
              fontWeight: 600,
              color: selectedTags.length > 0 ? '#222' : '#888',
              borderBottom: selectedTags.length > 0 ? '2.5px solid #222' : '2.5px solid transparent',
              padding: '8px 0',
              cursor: 'pointer',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.2s, border-bottom 0.2s',
            }}
          >
            Categories <span style={{ fontSize: 16, marginLeft: 2 }}>&#9660;</span>
          </button>
          {categoriesDropdownOpen && (
            <div style={{ position: 'absolute', top: 38, left: 0, minWidth: 180, background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 6, zIndex: 10, maxHeight: 260, overflowY: 'auto', boxShadow: '0 2px 8px #0001', padding: 8 }}>
              {TAG_OPTIONS.map(tag => (
                <div
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
                    else setSelectedTags([...selectedTags, tag]);
                  }}
                  style={{
                    padding: '7px 12px',
                    cursor: 'pointer',
                    background: selectedTags.includes(tag) ? '#e0e7ff' : '#fff',
                    color: selectedTags.includes(tag) ? '#1e3c72' : '#222',
                    fontWeight: selectedTags.includes(tag) ? 600 : 400,
                    borderRadius: 5,
                    marginBottom: 2,
                  }}
                >
                  {tag} {selectedTags.includes(tag) && <span style={{ float: 'right', color: '#1e3c72' }}>✓</span>}
                </div>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  style={{ marginTop: 8, background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%' }}
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* End Filter Bar */}
      <h2 className='text-2xl font-bold'>Discussion Panel</h2>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search threads by title..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: 10, fontSize: 16, borderRadius: 6, border: '1.5px solid #e0e0e0' }}
        />
        <button type="submit" style={{ padding: '10px 18px', fontSize: 15, borderRadius: 6, background: '#0079d3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Search</button>
        {searchResults !== null && (
          <button type="button" onClick={handleClearSearch} style={{ padding: '10px 18px', fontSize: 15, borderRadius: 6, background: '#eee', color: '#333', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        )}
      </form>
      {searchLoading && <div style={{ textAlign: 'center', color: '#888', marginBottom: 16 }}>Searching...</div>}
      {searchError && <div style={{ color: 'red', marginBottom: 16 }}>{searchError}</div>}
      {Array.isArray(searchResults) && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Search Results</h3>
          {(Array.isArray(searchResults) ? searchResults.length : 0) === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', fontFamily }}>No threads found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {(Array.isArray(searchResults) ? searchResults : []).map(thread => {
                  // For search results, threadId is the correct field for opening
                const threadId = thread.threadId || thread._id;
                const voteCount = getVoteCount(thread.votes || []);
                const userVote = getUserVote(thread.votes || [], currentUser?._id, currentUser?.role);
                const hover = hoveredThreadId === threadId;
                return (
                  <div
                    key={threadId}
                    style={{
                      ...threadCard,
                      ...(hover ? cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredThreadId(threadId)}
                    onMouseLeave={() => setHoveredThreadId(null)}
                    onClick={() => handleViewThread(threadId)}
                  >
                    <div style={threadCardVoting} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleVoteThread(threadId, 1)}
                        style={verticalButton(userVote === 1, '#ff4500')}
                        aria-label="Upvote"
                        disabled={pendingThreadVote === threadId}
                      >▲</button>
                      <span style={{ fontWeight: 700, fontSize: 17, margin: '6px 0', color: '#222', fontFamily }}>{voteCount}</span>
                      <button
                        onClick={() => handleVoteThread(threadId, -1)}
                        style={verticalButton(userVote === -1, '#7193ff')}
                        aria-label="Downvote"
                        disabled={pendingThreadVote === threadId}
                      >▼</button>
                    </div>
                    <div style={threadCardInfo}>
                      <div style={titleStyle}>{thread.title}</div>
                      {thread.tags && thread.tags.length > 0 && (
                        <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {thread.tags.map(tag => (
                            <span key={tag} style={threadTagPill}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <div style={snippetStyle}>
                      {thread.body && thread.body.length > 160 ? thread.body.substring(0, 160) + '...' : thread.body}
                      </div>
                      <div style={threadMetaRow}>
                        <span>By: {thread.createdBy?.name || 'Unknown'} ({thread.createdBy?.role || 'User'})</span>
                        <span>• {thread.posts?.length || 0} replies</span>
                        <span>• {new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Thread Form */}
      <form onSubmit={handleCreateThread} style={{ marginBottom: 32, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Create New Thread</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Tags:</label>
          <div style={{ position: 'relative', width: 320, maxWidth: '100%' }} ref={tagSelectRef}>
            <div
              style={{
                border: '1.5px solid #e0e0e0', borderRadius: 6, padding: '8px 12px', background: '#fff', cursor: 'pointer', minHeight: 40,
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6
              }}
              onClick={() => setTagSelectDropdownOpen(!tagSelectDropdownOpen)}
              tabIndex={0}
            >
              {tags.length === 0 && <span style={{ color: '#888' }}>Select tags...</span>}
              {tags.map(tag => (
                <span key={tag} style={{ background: '#e0e7ff', color: '#1e3c72', fontSize: 13, fontWeight: 600, borderRadius: 6, padding: '2px 10px', letterSpacing: 1 }}>{tag}</span>
              ))}
              <span style={{ marginLeft: 'auto', color: '#888', fontSize: 18 }}>&#9660;</span>
            </div>
            {tagSelectDropdownOpen && (
              <div style={{ position: 'absolute', top: 44, left: 0, right: 0, background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 6, zIndex: 10, maxHeight: 220, overflowY: 'auto', boxShadow: '0 2px 8px #0001' }}>
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSelectSearch}
                  onChange={e => setTagSelectSearch(e.target.value)}
                  style={{ width: '100%', padding: 8, border: 'none', borderBottom: '1px solid #eee', outline: 'none', fontSize: 14, borderRadius: '6px 6px 0 0' }}
                  autoFocus
                />
                {filteredTagSelectOptions.length === 0 && <div style={{ padding: 10, color: '#888' }}>No tags found</div>}
                {filteredTagSelectOptions.map(tag => (
                  <div
                    key={tag}
                    onClick={e => {
                      e.stopPropagation();
                      if (tags.includes(tag)) setTags(tags.filter(t => t !== tag));
                      else setTags([...tags, tag]);
                    }}
                    style={{
                      padding: '8px 12px', cursor: 'pointer', background: tags.includes(tag) ? '#e0e7ff' : '#fff', color: tags.includes(tag) ? '#1e3c72' : '#222', fontWeight: tags.includes(tag) ? 600 : 400
                    }}
                  >
                    {tag} {tags.includes(tag) && <span style={{ float: 'right', color: '#1e3c72' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <input
          type="text"
          placeholder="Thread title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1.5px solid #e0e0e0', marginBottom: 12 }}
        />
        <textarea
          placeholder="Thread body"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1.5px solid #e0e0e0', marginBottom: 12, height: 120, resize: 'none' }}
        />
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'inline-block', background: '#eee', color: '#333', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>
            Upload Photo
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setThreadImages(Array.from(e.target.files).slice(0, 5))} />
          </label>
          {threadImages && threadImages.length > 0 && (
            <span style={{ fontSize: 13, color: '#888', marginLeft: 8 }}>{threadImages.length} image(s) selected</span>
          )}
          {/* Preview selected images */}
          {threadImages && threadImages.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {threadImages.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${idx + 1}`}
                  style={{ maxWidth: 80, maxHeight: 60, borderRadius: 6, border: '1px solid #eee', cursor: 'pointer' }}
                  onClick={() => setImagePreview({ open: true, src: URL.createObjectURL(file) })}
                />
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          style={{ padding: '10px 24px', fontSize: 16, borderRadius: 8, background: '#0079d3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Create Thread
        </button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>

      {/* Filter by tag */}
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontWeight: 600, fontSize: 15, marginRight: 10 }}>Filter by tag:</span>
        <div style={{ display: 'inline-block', position: 'relative', width: 320, maxWidth: '100%' }} ref={tagFilterRef}>
          <div
            style={{
              border: '1.5px solid #e0e0e0', borderRadius: 6, padding: '8px 12px', background: '#fff', cursor: 'pointer', minHeight: 40,
              display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6
            }}
            onClick={() => setTagFilterDropdownOpen(!tagFilterDropdownOpen)}
            tabIndex={0}
          >
            {tagFilter.length === 0 && <span style={{ color: '#888' }}>Select tags...</span>}
            {tagFilter.map(tag => (
              <span key={tag} style={{ background: '#e0e7ff', color: '#1e3c72', fontSize: 13, fontWeight: 600, borderRadius: 6, padding: '2px 10px', letterSpacing: 1 }}>{tag}</span>
            ))}
            <span style={{ marginLeft: 'auto', color: '#888', fontSize: 18 }}>&#9660;</span>
          </div>
          {tagFilterDropdownOpen && (
            <div style={{ position: 'absolute', top: 44, left: 0, right: 0, background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 6, zIndex: 10, maxHeight: 220, overflowY: 'auto', boxShadow: '0 2px 8px #0001' }}>
              <input
                type="text"
                placeholder="Search tags..."
                value={tagFilterSearch}
                onChange={e => setTagFilterSearch(e.target.value)}
                style={{ width: '100%', padding: 8, border: 'none', borderBottom: '1px solid #eee', outline: 'none', fontSize: 14, borderRadius: '6px 6px 0 0' }}
                autoFocus
              />
              {filteredTagFilterOptions.length === 0 && <div style={{ padding: 10, color: '#888' }}>No tags found</div>}
              {filteredTagFilterOptions.map(tag => (
                <div
                  key={tag}
                  onClick={e => {
                    e.stopPropagation();
                    if (tagFilter.includes(tag)) setTagFilter(tagFilter.filter(t => t !== tag));
                    else setTagFilter([...tagFilter, tag]);
                  }}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', background: tagFilter.includes(tag) ? '#e0e7ff' : '#fff', color: tagFilter.includes(tag) ? '#1e3c72' : '#222', fontWeight: tagFilter.includes(tag) ? 600 : 400
                  }}
                >
                  {tag} {tagFilter.includes(tag) && <span style={{ float: 'right', color: '#1e3c72' }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        {tagFilter.length > 0 && (
          <button
            onClick={() => setTagFilter([])}
            style={{ marginLeft: 8, background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '2px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Threads List */}
      <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, fontFamily, paddingLeft: 8 }}>All Threads</h3>
      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: 40, fontFamily }}>Loading threads...</div>
      ) : (Array.isArray(filteredThreads) ? filteredThreads.length : 0) === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666', fontFamily }}>No threads yet. Be the first to start a discussion!</div>
      ) : (
        <div style={threadCardContainer}>
          {(Array.isArray(filteredThreads) ? filteredThreads : []).map(thread => {
            const voteCount = getVoteCount(thread.votes || []);
            const userVote = getUserVote(thread.votes || [], currentUser?._id, currentUser?.role);
            const hover = hoveredThreadId === thread._id;
            return (
              <div
                key={thread._id}
                style={{
                  ...threadCard,
                  ...(hover ? cardHover : {}),
                }}
                onMouseEnter={() => setHoveredThreadId(thread._id)}
                onMouseLeave={() => setHoveredThreadId(null)}
                onClick={() => handleViewThread(thread._id)}
              >
                {/* Voting bar */}
                <div style={threadCardVoting} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleVoteThread(thread._id, 1)}
                    style={verticalButton(userVote === 1, '#ff4500')}
                    aria-label="Upvote"
                    disabled={pendingThreadVote === thread._id}
                  >▲</button>
                  <span style={{ fontWeight: 700, fontSize: 17, margin: '6px 0', color: '#222', fontFamily }}>{voteCount}</span>
                  <button
                    onClick={() => handleVoteThread(thread._id, -1)}
                    style={verticalButton(userVote === -1, '#7193ff')}
                    aria-label="Downvote"
                    disabled={pendingThreadVote === thread._id}
                  >▼</button>
                </div>
                {/* Thread info */}
                <div style={threadCardInfo}>
                  <div style={titleStyle}>{thread.title}</div>
                  {Array.isArray(thread.tags) && thread.tags.length > 0 && (
                    <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {thread.tags.map(tag => (
                        <span key={tag} style={threadTagPill}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={snippetStyle}>
                    {thread.body && thread.body.length > 160 ? thread.body.substring(0, 160) + '...' : thread.body}
                  </div>
                  <div style={threadMetaRow}>
                    <span>By: {thread.createdBy?.name || 'Unknown'} ({thread.createdBy?.role || 'User'})</span>
                    <span>• {Array.isArray(thread.posts) ? thread.posts.length : 0} replies</span>
                    <span>• {new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {loading && page > 1 && <div style={{ textAlign: 'center', color: '#888', fontFamily }}>Loading more...</div>}
          <div ref={loader} />
          {!hasMore && !loading && <div style={{ textAlign: 'center', color: '#888', marginTop: 12, fontFamily }}>No more threads.</div>}
        </div>
      )}
      {/* Image Preview Modal */}
      {imagePreview.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setImagePreview({ open: false, src: '' })}>
          <img src={imagePreview.src} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 2px 16px #0008' }} alt="Preview" onClick={e => e.stopPropagation()} />
          <button onClick={() => setImagePreview({ open: false, src: '' })} style={{ position: 'absolute', top: 30, right: 40, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 20, fontSize: 28, width: 40, height: 40, cursor: 'pointer' }}>&times;</button>
        </div>
      )}
    </div>
  );
}