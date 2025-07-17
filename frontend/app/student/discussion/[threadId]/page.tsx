"use client";
import React, { useState } from "react";
import { useThread } from "../hooks/useThread";
import PostTree from "../components/PostTree";
import { useParams, useSearchParams } from "next/navigation";
import { addDiscussionPost, votePost, editDiscussionPost, deleteDiscussionPost, voteThread } from "../api/discussionApi";
import { DiscussionUser, DiscussionPost } from "../types";
import { ChevronUp, ChevronDown, User, Users, Shield, GraduationCap, MessageSquare } from "lucide-react";

const getRoleIcon = (role: string) => {
  switch (role) {
    case "Student": return <GraduationCap className="w-3 h-3 text-blue-500" />;
    case "Teacher": return <User className="w-3 h-3 text-green-500" />;
    case "Guardian": return <Users className="w-3 h-3 text-purple-500" />;
    case "Admin": return <Shield className="w-3 h-3 text-red-500" />;
    default: return <User className="w-3 h-3 text-gray-500" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "Student": return "text-blue-600 bg-blue-50";
    case "Teacher": return "text-green-600 bg-green-50";
    case "Guardian": return "text-purple-600 bg-purple-50";
    case "Admin": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

const getAvatarColor = (author: string) => {
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"];
  return colors[author.length % colors.length];
};

function getCurrentUser(): DiscussionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { _id: payload.userId, role: payload.role.charAt(0).toUpperCase() + payload.role.slice(1) } as DiscussionUser;
  } catch {
    return null;
  }
}

function buildPostTree(posts: DiscussionPost[]): DiscussionPost[] {
  const idToNode: { [key: string]: DiscussionPost & { replies: DiscussionPost[] } } = {};
  const roots: (DiscussionPost & { replies: DiscussionPost[] })[] = [];
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
  return roots;
}

export default function ThreadDetailPage({ userType = 'Student', ...props }: { userType?: string }) {
  const params = useParams();
  const threadId =
    params && typeof params.threadId === 'string'
      ? params.threadId
      : params && Array.isArray(params.threadId)
      ? params.threadId[0]
      : '';
  const { thread, loading, error, refetch } = useThread(threadId);
  const currentUser = getCurrentUser();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyImages, setReplyImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<{ open: boolean; src: string } | null>(null);
  const [mainReplyBody, setMainReplyBody] = useState("");
  const [mainReplyImages, setMainReplyImages] = useState<File[]>([]);
  const [threadVote, setThreadVote] = useState<1 | -1 | 0>(0);
  const searchParams = useSearchParams();
  const highlightId = searchParams ? searchParams.get('highlight') || undefined : undefined;

  const handleReply = async (parentPostId: string, body: string, files: File[]) => {
    if (!body.trim()) return;
    try {
      const formData = new FormData();
      formData.append('body', body);
      formData.append('parentPost', parentPostId);
      files.forEach(file => formData.append('images', file));
      await addDiscussionPost(threadId, formData);
      setReplyBody('');
      setReplyImages([]);
      setReplyingTo(null);
      refetch();
    } catch (err) {
      // handle error
    }
  };

  const handleVote = async (postId: string, value: 1 | -1) => {
    try {
      await votePost(threadId, postId, value);
      refetch();
    } catch (err) {}
  };

  const handleEdit = async (post: any) => {
    // Implement edit logic/modal as needed
  };

  const handleDelete = async (post: any) => {
    try {
      await deleteDiscussionPost(threadId, post._id);
      refetch();
    } catch (err) {}
  };

  const handleThreadVote = async (value: 1 | -1) => {
    setThreadVote(prev => (prev === value ? 0 : value));
    await voteThread(threadId, value);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-0">
      <div className="max-w-3xl mx-auto">
        {loading && <div className="text-center text-gray-500">Loading thread...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {thread && (
          <>
            {/* Thread Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
              <div className="flex gap-6 p-6">
                {/* Voting Section */}
                <div className="flex flex-col items-center space-y-2 pt-1">
                  <button
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors group ${threadVote === 1 ? 'bg-blue-100' : 'bg-gray-50 hover:bg-blue-50'}`}
                    onClick={() => handleThreadVote(1)}
                  >
                    <ChevronUp className={`w-5 h-5 ${threadVote === 1 ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                  </button>
                  <div className="bg-gray-100 rounded-full px-3 py-1 min-w-12 text-center">
                    <span className="text-sm font-bold text-gray-700">{(thread.votes || []).reduce((sum, v) => sum + v.value, 0) + threadVote}</span>
                  </div>
                  <button
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors group ${threadVote === -1 ? 'bg-red-100' : 'bg-gray-50 hover:bg-red-50'}`}
                    onClick={() => handleThreadVote(-1)}
                  >
                    <ChevronDown className={`w-5 h-5 ${threadVote === -1 ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'}`} />
                  </button>
                </div>
                {/* Thread Details */}
                <div className="flex-1">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(typeof thread.createdBy === 'object' ? thread.createdBy.name || thread.createdBy.email || 'U' : 'U')}`}>
                      <span className="text-white text-base font-medium">{typeof thread.createdBy === 'object' ? (thread.createdBy.name || thread.createdBy.email || 'U')[0].toUpperCase() : 'U'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{typeof thread.createdBy === 'object' ? thread.createdBy.name || thread.createdBy.email : 'Unknown'}</span>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(thread.createdByModel)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(thread.createdByModel)}`}>{thread.createdByModel}</span>
                        </div>
                        <span className="text-xs text-gray-500">{thread.createdAt ? new Date(thread.createdAt).toLocaleString() : ''}</span>
                        {thread.tags && thread.tags.length > 0 && thread.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full ml-1">{tag}</span>
                        ))}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{thread.title}</h2>
                      <p className="text-gray-700 text-base mb-3">{thread.body}</p>
                      {thread.images && thread.images.length > 0 && (
                        <div className="flex gap-3 flex-wrap mb-2">
                          {thread.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url || (img.data ? `data:${img.contentType};base64,${img.data}` : '')}
                              alt={`Thread Image ${idx + 1}`}
                              className="max-w-[120px] max-h-[80px] rounded-md border border-gray-200 cursor-pointer"
                              onClick={() => setImagePreview && setImagePreview({ open: true, src: img.url || (img.data ? `data:${img.contentType};base64,${img.data}` : '') })}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-500 text-sm border-t border-gray-100 pt-2">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{thread.posts ? thread.posts.length : 0} Comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Main Reply Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 p-6">
              <form onSubmit={async (e) => { e.preventDefault(); if (!mainReplyBody.trim()) return; const formData = new FormData(); formData.append('body', mainReplyBody); mainReplyImages.forEach(file => formData.append('images', file)); await addDiscussionPost(thread._id, formData); setMainReplyBody(''); setMainReplyImages([]); refetch(); }}>
                <textarea
                  placeholder="Write your reply to this thread..."
                  value={mainReplyBody}
                  onChange={e => setMainReplyBody(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                />
                <div className="mb-3">
                  <label className="font-medium mr-2">Images:</label>
                  <input type="file" accept="image/*" multiple onChange={e => setMainReplyImages(Array.from(e.target.files || []))} />
                  {mainReplyImages && mainReplyImages.length > 0 && <span className="ml-2 text-sm text-gray-500">{mainReplyImages.length} image(s) selected</span>}
                </div>
                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors">Reply</button>
              </form>
            </div>
            {/* Comments/Posts */}
            <div className="space-y-6">
              {thread.posts && thread.posts.length > 0 ? (
                buildPostTree(thread.posts).map(post => (
                  <PostTree
                    key={post._id}
                    post={post}
                    currentUser={currentUser}
                    onReply={handleReply}
                    onVote={handleVote}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    replyBody={replyBody}
                    setReplyBody={setReplyBody}
                    replyImages={replyImages}
                    setReplyImages={setReplyImages}
                    setImagePreview={setImagePreview}
                    highlightId={highlightId}
                  />
                ))
              ) : (
                <div className="text-gray-500 italic text-center py-8">No posts yet. Be the first to reply!</div>
              )}
            </div>
          </>
        )}
        {imagePreview && imagePreview.open && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setImagePreview(null)}>
            <img src={imagePreview.src} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" />
          </div>
        )}
      </div>
    </div>
  );
} 