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
  deleteDiscussionPost
} from '../../service/api';

// Helper to build a tree from flat posts array, sorted by upvotes
function buildPostTree(posts) {
  const idToNode = {};
  const roots = [];
  posts.forEach(post => {
    idToNode[post._id] = { ...post, replies: [] };
  });
  posts.forEach(post => {
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
    if (node.replies && node.replies.length > 0) {
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

function PostTree({ post, onReply, onVote, getVoteCount, getUserVote, replyingTo, setReplyingTo, replyBody, setReplyBody, replyImagesByPostId, setReplyImagesByPostId, currentUser, onEdit, onDelete, setImagePreview, highlightId }) {
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
        {post.images && post.images.length > 0 && (
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
            <button onClick={() => onVote(post._id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: getUserVote(post.votes, currentUser?._id) === 1 ? '#ff4500' : '#888' }}>▲</button>
            <span style={{ fontWeight: 600 }}>{getVoteCount(post.votes)}</span>
            <button onClick={() => onVote(post._id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: getUserVote(post.votes, currentUser?._id) === -1 ? '#7193ff' : '#888' }}>▼</button>
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
      {post.replies && post.replies.length > 0 && (
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
              replyBody={replyBody}
              setReplyBody={setReplyBody}
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
        style={{ width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ddd' }}
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
  const [nestedReplyBody, setNestedReplyBody] = useState('');
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

  const TAG_OPTIONS = ['CBSE', 'Maths', 'Science', 'JEE', 'NEET'];

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
      threadImages.forEach(file => formData.append('images', file));
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
      setNestedReplyBody('');
      setReplyingTo(null);
      setReplyImagesByPostId(prev => ({ ...prev, [parentPostId]: [] }));
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to add reply');
    }
  };

  const handleVoteThread = async (threadId, value) => {
    try {
      const token = localStorage.getItem('token');
      const thread = threads.find(t => t._id === threadId) || selectedThread;
      const userId = currentUser?._id;
      const userRole = currentUser?.role;
      const currentVote = thread && thread.votes ? thread.votes.find(v => v.user === userId && v.userModel === userRole) : null;
      let newValue = value;
      if (currentVote && currentVote.value === value) {
        // Remove vote (set to 0)
        newValue = 0;
      }
      await voteThread(threadId, newValue, token);
      fetchThreads();
      if (selectedThread && selectedThread._id === threadId) {
        const res = await fetchDiscussionThread(threadId);
        setSelectedThread(res.data);
      }
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const handleVotePost = async (postId, value) => {
    try {
      const token = localStorage.getItem('token');
      const post = selectedThread.posts.find(p => p._id === postId);
      const userId = currentUser?._id;
      const userRole = currentUser?.role;
      const currentVote = post && post.votes ? post.votes.find(v => v.user === userId && v.userModel === userRole) : null;
      let newValue = value;
      if (currentVote && currentVote.value === value) {
        newValue = 0;
      }
      await votePost(selectedThread._id, postId, newValue, token);
      const res = await fetchDiscussionThread(selectedThread._id);
      setSelectedThread(res.data);
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const getVoteCount = (votes) => {
    return votes.reduce((sum, vote) => sum + vote.value, 0);
  };

  const getUserVote = (votes, userId) => {
    const vote = votes.find(v => v.user === userId);
    return vote ? vote.value : 0;
  };

  // Filtered threads
  const getThreadUpvotes = (thread) => (thread.votes || []).reduce((sum, v) => sum + v.value, 0);
  const filteredThreads = (tagFilter.length > 0
    ? threads.filter(thread => thread.tags && tagFilter.some(tag => thread.tags.includes(tag)))
    : threads
  ).slice().sort((a, b) => getThreadUpvotes(b) - getThreadUpvotes(a));

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
                  color: getUserVote(selectedThread.votes, 'current-user-id') === 1 ? '#ff4500' : '#888'
                }}
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
                  color: getUserVote(selectedThread.votes, 'current-user-id') === -1 ? '#7193ff' : '#888'
                }}
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
                replyBody={nestedReplyBody}
                setReplyBody={setNestedReplyBody}
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
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Discussion Panel</h2>
      
      {/* Create Thread Form */}
      <form onSubmit={handleCreateThread} style={{ marginBottom: 32, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Create New Thread</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, display: 'block' }}>Tags:</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {TAG_OPTIONS.map(tag => (
              <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, background: tags.includes(tag) ? '#e0e7ff' : '#f3f4f6', color: tags.includes(tag) ? '#1e3c72' : '#444', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={tags.includes(tag)}
                  onChange={e => {
                    if (e.target.checked) setTags([...tags, tag]);
                    else setTags(tags.filter(t => t !== tag));
                  }}
                  style={{ accentColor: '#1e3c72', marginRight: 4 }}
                />
                {tag}
              </label>
            ))}
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
          style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1.5px solid #e0e0e0', marginBottom: 12 }}
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
        {TAG_OPTIONS.map(tag => (
          <button
            key={tag}
            onClick={() => setTagFilter(
              tagFilter.includes(tag)
                ? tagFilter.filter(t => t !== tag)
                : [...tagFilter, tag]
            )}
            style={{
              marginRight: 8,
              background: tagFilter.includes(tag) ? '#1e3c72' : '#e0e7ff',
              color: tagFilter.includes(tag) ? '#fff' : '#1e3c72',
              border: 'none',
              borderRadius: 6,
              padding: '2px 12px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              letterSpacing: 1
            }}
          >
            {tag}
          </button>
        ))}
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
      <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>All Threads</h3>
      {loading && page === 1 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading threads...</div>
      ) : filteredThreads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>No threads yet. Be the first to start a discussion!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredThreads.map(thread => (
            <div key={thread._id} style={{ padding: 20, border: '1px solid #eee', borderRadius: 8, background: '#fff', cursor: 'pointer' }} onClick={() => handleViewThread(thread._id)}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#333' }}>
                {thread.title}
              </div>
              {/* Show tags in thread list */}
              {thread.tags && thread.tags.length > 0 && (
                <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
                  {thread.tags.map(tag => (
                    <span key={tag} style={{ background: '#e0e7ff', color: '#1e3c72', fontSize: 13, fontWeight: 600, borderRadius: 6, padding: '2px 10px', letterSpacing: 1 }}>{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ color: '#666', marginBottom: 12, lineHeight: 1.5 }}>
                {thread.body.length > 200 ? thread.body.substring(0, 200) + '...' : thread.body}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#888' }}>
                  By: {thread.createdBy?.name || 'Unknown'} ({thread.createdBy?.role || 'User'}) • {thread.posts?.length || 0} replies
                </span>
                <span style={{ fontSize: 14, color: '#888', marginLeft: 12 }}>
                  Votes: {(thread.votes || []).reduce((sum, v) => sum + v.value, 0)}
                </span>
                <span style={{ fontSize: 14, color: '#888' }}>
                  {new Date(thread.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {loading && page > 1 && <div style={{ textAlign: 'center', color: '#888' }}>Loading more...</div>}
          <div ref={loader} />
          {!hasMore && !loading && <div style={{ textAlign: 'center', color: '#888', marginTop: 12 }}>No more threads.</div>}
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