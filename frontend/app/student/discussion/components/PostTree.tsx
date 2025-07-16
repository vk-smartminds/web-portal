import React, { useEffect, useRef } from 'react';
import { DiscussionPost, DiscussionUser } from '../types';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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

function getImageSrc(img: { url?: string; data?: string; contentType?: string }): string {
  if (typeof img.url === 'string' && img.url) return img.url;
  if (img.contentType && img.data) return `data:${img.contentType};base64,${img.data}`;
  return '';
}

function safeSrc(src: string | undefined | null): string {
  if (typeof src === 'string' && src) return src;
  return '';
}

const PostTree: React.FC<PostTreeProps> = ({ post, currentUser, onReply, onVote, onEdit, onDelete, replyingTo, setReplyingTo, replyBody, setReplyBody, replyImages, setReplyImages, setImagePreview, highlightId }) => {
  const [highlight, setHighlight] = React.useState(false);
  const [collapsed, setCollapsed] = useState(true);
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
  const hasReplies = Array.isArray(post.replies) && post.replies.length > 0;
  return (  
    <div
      ref={postRef}
      className={`relative group ${post.parentPost ? 'pl-6 border-l-2 border-gray-200' : ''} mb-4`}
      style={{ background: highlight ? '#fff9c4' : isCreator ? '#f0f8ff' : '#fff', transition: 'background 0.3s' }}
    >
      {/* Plus/Minus for collapsing/expanding replies */}
      {hasReplies && (
        <button
          className="absolute -left-4 top-4 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? "Expand replies" : "Collapse replies"}
        >
          {collapsed ? (
            <Plus className="w-4 h-4 text-gray-500" />
          ) : (
            <Minus className="w-4 h-4 text-gray-500" />
          )}
        </button>
      )}
      <div className="bg-white rounded-lg p-4 mb-2 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-blue-700">
            {typeof post.createdBy === 'object' ? post.createdBy.name || post.createdBy.email : 'Unknown'}
            {isCreator && <span className="text-xs text-blue-500 ml-1">(You)</span>}
          </span>
          <span className="text-xs text-gray-500">({typeof post.createdBy === 'object' ? post.createdBy.role : 'User'})</span>
          {post.edited && <span className="text-xs text-gray-400 ml-2">(edited)</span>}
        </div>
        <p className="text-gray-800 text-base mb-2 whitespace-pre-line">{post.body}</p>
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={safeSrc(getImageSrc(img)) || ""}
                alt={`Post Image ${idx + 1}`}
                className="max-w-[120px] max-h-[80px] rounded border border-gray-200 cursor-pointer"
              />
            ))}
          </div>
        )}
        <div className="flex gap-4 text-gray-500 mt-3 items-center text-sm">
          <button
            className={`flex items-center gap-1 hover:text-blue-600 ${getUserVote(post.votes, currentUser?._id, currentUser?.role) === 1 ? 'text-blue-600 font-bold' : ''}`}
            onClick={() => onVote(post._id, 1)}
          >
            ▲
          </button>
          <span className="font-semibold min-w-[24px] text-center text-gray-800">{getVoteCount(post.votes)}</span>
          <button
            className={`flex items-center gap-1 hover:text-red-500 ${getUserVote(post.votes, currentUser?._id, currentUser?.role) === -1 ? 'text-red-500 font-bold' : ''}`}
            onClick={() => onVote(post._id, -1)}
          >
            ▼
          </button>
          <button className="flex items-center gap-1 hover:text-blue-700" onClick={() => setReplyingTo(post._id)}>
            Reply
          </button>
          {isCreator && !post.deleted && (
            <>
              <button onClick={() => onEdit(post)} className="ml-2 text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => onDelete(post)} className="ml-2 text-xs text-red-500 hover:underline">Delete</button>
            </>
          )}
        </div>
        {post.deleted && (
          <div className="text-red-500 italic mt-2">This message was deleted.</div>
        )}
        {replyingTo === post._id && (
          <form onSubmit={e => { e.preventDefault(); onReply(post._id, replyBody, replyImages); setReplyBody(''); setReplyImages([]); setReplyingTo(null); }} className="mt-4" encType="multipart/form-data">
            <textarea
              placeholder="Write your reply..."
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={2}
              className="w-full p-2 text-sm rounded bg-white border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <div className="flex items-center gap-3 mt-1">
              <label className="inline-block bg-gray-100 text-gray-700 rounded px-3 py-1 font-semibold cursor-pointer">
                Upload Photo
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => setReplyImages(Array.from(e.target.files || []))} />
              </label>
              {replyImages && replyImages.length > 0 && (
                <span className="text-xs text-gray-500">{replyImages.length} image(s) selected</span>
              )}
              <button type="submit" className="px-4 py-1 rounded bg-blue-600 text-white font-semibold text-xs">Post</button>
              <button type="button" onClick={() => { setReplyingTo(null); setReplyBody(''); setReplyImages([]); }} className="px-4 py-1 rounded bg-gray-100 text-gray-700 font-semibold text-xs">Cancel</button>
            </div>
            {replyImages && replyImages.length > 0 && (
              <div className="flex gap-2 mt-2">
                {replyImages.map((file, idx) => (
                  <img
                    key={idx}
                    src={file ? safeSrc(URL.createObjectURL(file)) || "" : ""}
                    alt={`Preview ${idx + 1}`}
                    className="max-w-[80px] max-h-[60px] rounded border border-gray-200 cursor-pointer"
                  />
                ))}
              </div>
            )}
          </form>
        )}
      </div>
      {hasReplies && !collapsed && (
        <div className="relative pl-2 mt-2">
          {/* Vertical line for thread, ending at last reply */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" style={{height: `calc(100% - 0.5rem)`}} />
          {(post.replies || []).map((child, idx) => (
            <div key={child._id} className="relative">
              {/* For the last reply, cut the line at the end */}
              {idx === (post.replies?.length || 0) - 1 && (
                <div className="absolute left-0 top-0 w-0.5 bg-gray-200" style={{height: '1.5rem'}} />
              )}
              <PostTree
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostTree;