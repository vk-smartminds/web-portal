import React from 'react';
import { DiscussionPost, DiscussionUser } from '../types';

interface PostTreeProps {
  post: DiscussionPost;
  currentUser: DiscussionUser | null;
  onReply: (parentPostId: string, body: string, files: File[]) => void;
  onVote: (postId: string, value: 1 | -1) => void;
  onEdit: (post: DiscussionPost) => void;
  onDelete: (post: DiscussionPost) => void;
  replyingTo: string | null;
  setReplyingTo: (postId: string | null) => void;
  replyBody: string;
  setReplyBody: (body: string) => void;
  replyImages: File[];
  setReplyImages: (files: File[]) => void;
  setImagePreview: (img: { open: boolean; src: string }) => void;
  highlightId?: string;
}

const PostTree: React.FC<PostTreeProps> = ({ post, currentUser, onReply, onVote, onEdit, onDelete, replyingTo, setReplyingTo, replyBody, setReplyBody, replyImages, setReplyImages, setImagePreview, highlightId }) => {
  const [highlight, setHighlight] = React.useState(false);
  const postRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (highlightId && post._id === highlightId) {
      setHighlight(true);
      postRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timeout = setTimeout(() => setHighlight(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [highlightId, post._id]);
  let isCreator = false;
  if (currentUser && post.createdBy) {
    const postCreatorId = typeof post.createdBy === 'object' ? post.createdBy._id : post.createdBy;
    isCreator = String(postCreatorId) === String(currentUser._id);
  }
  const getVoteCount = (votes: any[]) => (votes || []).reduce((sum, v) => sum + v.value, 0);
  const getUserVote = (votes: any[], userId: string, userRole: string) => {
    const v = (votes || []).find(v => v.user === userId && v.userModel === userRole);
    return v ? v.value : 0;
  };
  return (
    <div ref={postRef} style={{ marginLeft: post.parentPost ? 32 : 0, borderLeft: post.parentPost ? '2px solid #e0e0e0' : 'none', paddingLeft: 16, position: 'relative', background: highlight ? '#fff9c4' : isCreator ? '#f0f8ff' : '#fff', transition: 'background 0.3s' }}>
      <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, background: 'inherit', marginBottom: 8 }}>
        <p style={{ color: '#333', marginBottom: 12, lineHeight: 1.5 }}>
          {post.body}
          {post.edited && <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>(edited)</span>}
        </p>
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
            By: {typeof post.createdBy === 'object' ? post.createdBy.name || post.createdBy.email : 'Unknown'}{isCreator && <span style={{ color: '#0079d3', fontWeight: 600 }}> (You)</span>} ({typeof post.createdBy === 'object' ? post.createdBy.role : 'User'})
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
          <form onSubmit={e => { e.preventDefault(); onReply(post._id, replyBody, replyImages); setReplyBody(''); setReplyImages([]); setReplyingTo(null); }} style={{ marginTop: 12 }} encType="multipart/form-data">
            <textarea
              placeholder="Write your reply..."
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: 8, fontSize: 15, borderRadius: 6, border: '1px solid #ddd', height: 80, resize: 'none' }}
            />
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'inline-block', background: '#eee', color: '#333', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>
                Upload Photo
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setReplyImages(Array.from(e.target.files || []))} />
              </label>
              {replyImages && replyImages.length > 0 && (
                <span style={{ fontSize: 13, color: '#888' }}>{replyImages.length} image(s) selected</span>
              )}
              <button type="submit" style={{ padding: '6px 14px', fontSize: 13, borderRadius: 6, background: '#0079d3', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Post</button>
              <button type="button" onClick={() => { setReplyingTo(null); setReplyBody(''); setReplyImages([]); }} style={{ padding: '6px 14px', fontSize: 13, borderRadius: 6, background: '#eee', color: '#333', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
            {replyImages && replyImages.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {replyImages.map((file, idx) => (
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
        )}
      </div>
      {Array.isArray(post.replies) && post.replies.length > 0 && (
        <div style={{ marginLeft: 0 }}>
          {post.replies.map(child => (
            <PostTree
              key={child._id}
              post={child}
              currentUser={currentUser}
              onReply={onReply}
              onVote={onVote}
              onEdit={onEdit}
              onDelete={onDelete}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              replyImages={replyImages}
              setReplyImages={setReplyImages}
              setImagePreview={setImagePreview}
              highlightId={highlightId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostTree; 