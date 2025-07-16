import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Award, Share2, MoreHorizontal } from 'lucide-react';
import { DiscussionPost, DiscussionUser } from '../types';

interface ThreadCommentProps {
  post: DiscussionPost;
  level?: number;
  highlight?: boolean;
}

const getUserAvatar = (post: DiscussionPost) => {
  // No avatar in DiscussionUser type, so always use default
  return '/default-avatar.png';
};

const getUserName = (post: DiscussionPost) => {
  if (typeof post.createdBy === 'object') return post.createdBy.name || post.createdBy.email || 'Unknown';
  return 'Unknown';
};

const getTimeAgo = (post: DiscussionPost) => {
  // You can replace this with a real time-ago function
  return post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
};

const ThreadComment: React.FC<ThreadCommentProps> = ({ post, level = 0, highlight }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [votes, setVotes] = useState(() => (post.votes || []).reduce((sum, v) => sum + v.value, 0));
  const [userVote, setUserVote] = useState<null | 'up' | 'down'>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight]);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setVotes(votes - (type === 'up' ? 1 : -1));
      setUserVote(null);
    } else {
      const adjustment = userVote ? (type === 'up' ? 2 : -2) : (type === 'up' ? 1 : -1);
      setVotes(votes + adjustment);
      setUserVote(type);
    }
  };

  const toggleExpanded = () => setIsExpanded((v) => !v);

  return (
    <div
      ref={ref}
      className={`${level > 0 ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''} rounded-md ${highlight ? 'bg-yellow-100 border-2 border-yellow-400' : ''}`}
    >
      <div className="bg-gray-800 rounded-lg p-4 mb-3">
        {/* Comment Header */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={getUserAvatar(post)}
            alt={getUserName(post)}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-orange-400 font-semibold">{getUserName(post)}</span>
          <span className="text-gray-400 text-sm">• {getTimeAgo(post)}</span>
          {post.edited && <span className="text-gray-400 text-sm">• Edited</span>}
        </div>

        {/* Comment Content */}
        <p className="text-gray-100 mb-3 whitespace-pre-line">{post.body}</p>
        {Array.isArray(post.images) && post.images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img.url || `data:${img.contentType};base64,${img.data}`}
                alt={`Post Image ${idx + 1}`}
                className="max-w-[120px] max-h-[80px] rounded border border-gray-700 cursor-pointer"
              />
            ))}
          </div>
        )}

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-gray-400 text-sm mt-3">
          {/* Vote Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleVote('up')}
              className={`p-1 rounded hover:bg-gray-700 ${userVote === 'up' ? 'text-orange-400' : ''}`}
            >
              <ChevronUp size={16} />
            </button>
            <span className={`font-medium ${votes > 0 ? 'text-orange-400' : votes < 0 ? 'text-blue-400' : 'text-gray-400'}`}>{votes > 0 ? votes : Math.abs(votes)}</span>
            <button
              onClick={() => handleVote('down')}
              className={`p-1 rounded hover:bg-gray-700 ${userVote === 'down' ? 'text-blue-400' : ''}`}
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Reply Button */}
          <button className="flex items-center gap-1 hover:text-gray-200">
            <MessageSquare size={16} />
            Reply
          </button>

          {/* Award Button */}
          <button className="flex items-center gap-1 hover:text-gray-200">
            <Award size={16} />
            Award
          </button>

          {/* Share Button */}
          <button className="flex items-center gap-1 hover:text-gray-200">
            <Share2 size={16} />
            Share
          </button>

          {/* More Options */}
          <button className="flex items-center gap-1 hover:text-gray-200">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Nested Comments */}
      {Array.isArray(post.replies) && post.replies.length > 0 && (
        <div className="ml-4">
          {isExpanded && post.replies.map((reply) => (
            <ThreadComment key={reply._id} post={reply} level={level + 1} />
          ))}
          {/* Collapse/Expand Button */}
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm py-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                {post.replies.length} more repl{post.replies.length === 1 ? 'y' : 'ies'}
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                {post.replies.length} more repl{post.replies.length === 1 ? 'y' : 'ies'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreadComment; 