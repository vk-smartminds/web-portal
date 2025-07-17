"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useThreads } from "./hooks/useThreads";
import { ChevronUp, ChevronDown, MessageSquare, Plus, Search, User, Users, Shield, GraduationCap, Bell } from "lucide-react";
import { createDiscussionThread } from "./api/discussionApi";
import { voteThread } from "./api/discussionApi";
import { logout } from '../../../utils/auth.js';
import { getUserData } from '../../../utils/auth.js';
import BellIcon from '../../../icons/BellIcon';
import { useNotifications } from '../../../components/NotificationProvider';

const TAG_OPTIONS = [
  "CBSE", "Maths", "Chemistry", "Physics", "Science", "JEE", "NEET", "Biology", "English", "Hindi", "Social Studies",
  "History", "Geography", "Civics", "Economics", "Political Science", "Philosophy", "Religion", "Art", "Music", "Dance",
  "Theatre", "Film", "Literature", "Language", "Communication", "Public Speaking", "Leadership", "Management",
  "Entrepreneurship", "Marketing", "Sales", "Customer Service", "HR", "Finance", "Accounting", "Taxation", "Law",
  "Criminal Justice", "Social Work", "Psychology", "Sociology", "Anthropology"
];

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

export default function DiscussionPanel({ userType = 'Student' }: { userType?: string }) {
  const { threads, loading, error } = useThreads();
  const [activeTab, setActiveTab] = useState<'latest' | 'hot' | 'categories'>('latest');
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<string>("");
  const [threadImages, setThreadImages] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [voteState, setVoteState] = useState<{ [key: string]: 1 | -1 | 0 }>({});
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [subjectsMenuOpen, setSubjectsMenuOpen] = useState(false);
  const [subjectsSearch, setSubjectsSearch] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [visibleThreads, setVisibleThreads] = useState(8);
  const subjectsMenuCloseTimeout = useRef<NodeJS.Timeout | null>(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);

  const userData = typeof window !== 'undefined' ? getUserData() : null;
  const userEmail = userData && userData.email ? userData.email : '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let filteredThreads = threads;
  if (roleFilter) {
    filteredThreads = filteredThreads.filter(thread => thread.createdByModel === roleFilter);
  } else if (subjectFilter) {
    filteredThreads = filteredThreads.filter(thread => thread.tags && thread.tags.includes(subjectFilter));
  }
  if (activeTab === 'hot') {
    filteredThreads = filteredThreads.slice().sort((a, b) => ((b.votes || []).reduce((sum, v) => sum + v.value, 0)) - ((a.votes || []).reduce((sum, v) => sum + v.value, 0)));
  } else if (activeTab === 'latest') {
    filteredThreads = filteredThreads.slice().sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  const handleVote = async (threadId: string, value: 1 | -1) => {
    const current = voteState[threadId] || 0;
    let newValue = value;
    if (current === value) {
      // User is toggling off their vote; remove from UI, but do not send value 0 to backend
      setVoteState(prev => ({ ...prev, [threadId]: 0 }));
      // Optionally, you can call a remove-vote endpoint here if you implement one
      return;
    } else {
      setVoteState(prev => ({ ...prev, [threadId]: value }));
    }
    try {
      await voteThread(threadId, value);
      // Optionally, refetch thread data here
    } catch (err) {
      alert('Failed to vote');
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || !tag) return;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', body);
    formData.append('tags[]', tag);
    threadImages.forEach(file => formData.append('images', file));
    try {
      await createDiscussionThread(formData);
      setShowCreate(false);
      setTitle("");
      setBody("");
      setTag("");
      setThreadImages([]);
      // Optionally, refetch threads if needed
    } catch (err) {
      // Optionally, show error
      alert('Failed to create thread');
    }
  };

  const handleNotifClick = () => {
    setShowNotif((prev) => !prev);
    if (unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length) markAsRead(unreadIds);
    }
  };

  const handleNotificationItemClick = (notif) => {
    setShowNotif(false);
    if (notif.threadId && notif.postId) {
      router.push(`/student/discussion/${notif.threadId}?highlight=${notif.postId}`);
    } else if (notif.threadId) {
      router.push(`/student/discussion/${notif.threadId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#5B43EF' }}>
                  <span className="sr-only">VK Global Logo</span>
                </div>  
                <span className="text-xl font-bold text-gray-900">
                iscussion</span>
              </div>
              <div className="flex items-center space-x-6">
                <button onClick={() => setActiveTab('latest')} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'latest' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}>Latest</button>
                <button onClick={() => setActiveTab('hot')} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'hot' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}>Hot</button>
                <div ref={categoriesDropdownRef} className="relative">
                  <button onClick={() => setCategoriesDropdownOpen(v => !v)} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${roleFilter || subjectFilter ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}>Categories <span className="ml-1">▼</span></button>
                  {categoriesDropdownOpen && (
                    <div className="absolute top-10 left-0 min-w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                      <div className="flex flex-row gap-2 mb-2">
                        {['Admin', 'Student', 'Teacher', 'Guardian'].map(role => (
                          <button
                            key={role}
                            onClick={() => { setRoleFilter(role); setSubjectFilter(null); setCategoriesDropdownOpen(false); }}
                            className={`px-3 py-2 rounded-md font-semibold transition-colors ${roleFilter === role ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'}`}
                          >
                            {role}
                          </button>
                        ))}
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            if (subjectsMenuCloseTimeout.current) {
                              clearTimeout(subjectsMenuCloseTimeout.current);
                              subjectsMenuCloseTimeout.current = null;
                            }
                            setSubjectsMenuOpen(true);
                          }}
                          onMouseLeave={() => {
                            if (subjectsMenuCloseTimeout.current) clearTimeout(subjectsMenuCloseTimeout.current);
                            subjectsMenuCloseTimeout.current = setTimeout(() => {
                              setSubjectsMenuOpen(false);
                              subjectsMenuCloseTimeout.current = null;
                            }, 3000);
                          }}
                        >
                          <div
                            className={`px-3 py-2 rounded-md font-semibold cursor-pointer transition-colors ${subjectsMenuOpen || subjectFilter ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                            onClick={() => {
                              if (subjectsMenuCloseTimeout.current) {
                                clearTimeout(subjectsMenuCloseTimeout.current);
                                subjectsMenuCloseTimeout.current = null;
                              }
                              setSubjectsMenuOpen((open) => !open);
                            }}
                          >
                            Topics
                          </div>
                          {subjectsMenuOpen && (
                            <div className="absolute left-full top-0 ml-2 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 flex flex-col max-h-64 overflow-y-auto">
                              <input
                                type="text"
                                placeholder="Search topics..."
                                value={subjectsSearch}
                                onChange={e => setSubjectsSearch(e.target.value)}
                                className="mb-2 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {TAG_OPTIONS.filter(tag => tag.toLowerCase().includes(subjectsSearch.toLowerCase())).map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => { setSubjectFilter(tag); setRoleFilter(null); setCategoriesDropdownOpen(false); setSubjectsMenuOpen(false); }}
                                  className={`px-3 py-2 rounded-md text-left transition-colors ${subjectFilter === tag ? 'bg-blue-600 text-white' : 'hover:bg-blue-100 hover:text-blue-700'}`}
                                >
                                  {tag}
                                </button>
                              ))}
                              {subjectFilter && (
                                <button onClick={() => { setSubjectFilter(null); setCategoriesDropdownOpen(false); setSubjectsMenuOpen(false); }} className="mt-2 w-full bg-gray-100 text-gray-700 rounded-md py-1 font-semibold">Clear Topic</button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {(roleFilter || subjectFilter) && (
                        <button onClick={() => { setRoleFilter(null); setSubjectFilter(null); setCategoriesDropdownOpen(false); }} className="mt-2 w-full bg-gray-100 text-gray-700 rounded-md py-1 font-semibold">Clear Filter</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <button onClick={handleNotifClick} className="p-2 rounded-full hover:bg-gray-100 transition relative">
                  <BellIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b font-semibold">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm">No notifications</div>
                    ) : (
                      notifications.slice(0, 15).map((n) => (
                        <div
                          key={n._id}
                          className={`px-4 py-2 text-sm border-b last:border-b-0 cursor-pointer ${n.read ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`}
                          onClick={() => handleNotificationItemClick(n)}
                        >
                          {n.message}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors border border-gray-200 focus:outline-none"
                  aria-label="Profile"
                  type="button"
                >
                  <User className="w-6 h-6 text-gray-600" />
                </button>
                {profileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-fade-in"
                    style={{ top: '110%' }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-semibold text-gray-900 text-base">My Profile</div>
                      <div className="text-xs text-gray-500">{userEmail || 'Unknown'}</div>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm"
                      onClick={() => { setProfileMenuOpen(false); router.push('/student/profile'); }}
                    >Profile</button>
                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm">My Activity</button>
                    <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm" onClick={() => { setProfileMenuOpen(false); router.push('/settings?tab=support'); }}>
                      Help & Support
                    </button>
                    <div className="border-t border-gray-100 my-2" />
                    <button
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                      onClick={async () => { setProfileMenuOpen(false); await logout(); router.push('/login'); }}
                    >Logout</button>
                  </div>
                )}
              </div>
              <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Thread</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {showCreate && (
            <div className="relative w-full max-w-xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 right-0 h-2 rounded-t-3xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-300" />
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">✨ Create Thread</h2>
                <p className="text-gray-500 text-base">Share your thoughts with the community</p>
              </div>
              <form onSubmit={handleCreateThread}>
                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2" htmlFor="threadTitle">Thread Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} id="threadTitle" maxLength={100} placeholder="What's on your mind?" className="form-input w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" required />
                  <div className="text-right text-xs text-gray-400 mt-1">{title.length}/100</div>
                </div>
                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2" htmlFor="threadBody">Thread Content</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} id="threadBody" maxLength={2000} placeholder="Share your thoughts, ask questions, or start a discussion..." className="form-textarea w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-lg min-h-[120px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white" required />
                  <div className="text-right text-xs text-gray-400 mt-1">{body.length}/2000</div>
                </div>
                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2" htmlFor="threadTag">Category</label>
                  <select
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    id="threadTag"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl text-lg bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a category...</option>
                    {TAG_OPTIONS.map(tagOption => (
                      <option key={tagOption} value={tagOption}>{tagOption}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2">Images (Optional)</label>
                  <div
                    className={"border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative bg-white/80 hover:border-indigo-400 " + (threadImages.length > 0 ? 'border-indigo-400' : 'border-gray-200')}
                    onClick={() => document.getElementById('threadImageInput')?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-indigo-200'); }}
                    onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove('ring-2', 'ring-indigo-200'); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ring-2', 'ring-indigo-200');
                      if (e.dataTransfer.files.length > 0) setThreadImages(Array.from(e.dataTransfer.files));
                    }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl mb-2">📸</div>
                      <div className="text-base font-medium text-gray-700 mb-1">Drop images here or click to browse</div>
                      <div className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</div>
                      <input
                        type="file"
                        id="threadImageInput"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        multiple
                        onChange={e => setThreadImages(Array.from(e.target.files || []))}
                      />
                    </div>
                  </div>
                  {threadImages && threadImages.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4">
                      {threadImages.map((file, idx) => (
                        <div key={idx} className="relative inline-block">
                          <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className="w-32 h-24 object-cover rounded-lg border border-gray-200" />
                          <button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow hover:bg-red-600" onClick={e => { e.stopPropagation(); setThreadImages(threadImages.filter((_, i) => i !== idx)); }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-500 font-semibold text-lg hover:bg-gray-200 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all">Create Thread</button>
                </div>
              </form>
            </div>
          )}
          {loading && <div className="text-center text-gray-500">Loading threads...</div>}
          {error && <div className="text-center text-red-500">{error}</div>}
          {filteredThreads.filter(thread => thread.title.toLowerCase().includes(search.toLowerCase()) || thread.body.toLowerCase().includes(search.toLowerCase())).slice(0, visibleThreads).length === 0 && !loading && !error && (
            <div className="text-center text-gray-400 text-lg py-12">No posts available</div>
          )}
          <div className="space-y-6">
            {filteredThreads
              .filter(thread => thread.title.toLowerCase().includes(search.toLowerCase()) || thread.body.toLowerCase().includes(search.toLowerCase()))
              .slice(0, visibleThreads)
              .map(thread => {
                const vote = voteState[thread._id] || 0;
                const totalVotes = (thread.votes || []).reduce((sum, v) => sum + v.value, 0) + vote;
                return (
                  <div key={thread._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/student/discussion/${thread._id}`)}>
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Voting Section */}
                        <div className="flex flex-col items-center space-y-2 pt-1">
                          <button
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors group ${vote === 1 ? 'bg-blue-100' : 'bg-gray-50 hover:bg-blue-50'}`}
                            onClick={e => { e.stopPropagation(); handleVote(thread._id, 1); }}
                          >
                            <ChevronUp className={`w-5 h-5 ${vote === 1 ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                          </button>
                          <div className="bg-gray-100 rounded-full px-3 py-1 min-w-12 text-center">
                            <span className="text-sm font-bold text-gray-700">{totalVotes}</span>
                          </div>
                          <button
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors group ${vote === -1 ? 'bg-red-100' : 'bg-gray-50 hover:bg-red-50'}`}
                            onClick={e => { e.stopPropagation(); handleVote(thread._id, -1); }}
                          >
                            <ChevronDown className={`w-5 h-5 ${vote === -1 ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'}`} />
                          </button>
                        </div>
                        {/* Thread Details */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-3 mb-3">
                            {/* Avatar removed as per user request */}
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
                              <h2 className="text-lg font-semibold text-gray-900 mb-2">{thread.title}</h2>
                              <p className="text-gray-700 text-sm mb-1">{thread.body.length > 180 ? thread.body.slice(0, 180) + '...' : thread.body}</p>
                              {thread.createdAt && (
                                <div className="text-xs text-gray-400 mb-2">{new Date(thread.createdAt).toLocaleString()}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                <MessageSquare className="w-4 h-4" />
                                <span>{thread.posts ? thread.posts.length : 0}</span>
                              </div>
                            </div>
                            {/* Placeholder for more actions */}
                            <div className="flex items-center space-x-2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {filteredThreads.filter(thread => thread.title.toLowerCase().includes(search.toLowerCase()) || thread.body.toLowerCase().includes(search.toLowerCase())).length > visibleThreads && (
              <div className="flex justify-center mt-6">
                <button
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 transition-colors"
                  onClick={() => setVisibleThreads(visibleThreads + 8)}
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
