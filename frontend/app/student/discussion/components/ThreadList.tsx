import React from 'react';
import { DiscussionThread } from '../types';

interface ThreadListProps {
  threads: DiscussionThread[];
  loading: boolean;
  error?: string;
  onSelectThread: (thread: DiscussionThread) => void;
  onCreateThread: () => void;
}

const ThreadList: React.FC<ThreadListProps> = ({ threads, loading, error, onSelectThread, onCreateThread }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Discussion Threads</h2>
        <button onClick={onCreateThread} style={{ padding: '8px 18px', borderRadius: 6, background: '#0079d3', color: '#fff', fontWeight: 600, border: 'none', fontSize: 15, cursor: 'pointer' }}>+ New Thread</button>
      </div>
      {loading && <div>Loading threads...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {threads.map(thread => (
          <li key={thread._id} style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 12, padding: 16, cursor: 'pointer', background: '#fafbfc' }} onClick={() => onSelectThread(thread)}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{thread.title}</div>
            <div style={{ color: '#555', margin: '6px 0 2px 0' }}>{thread.body.slice(0, 120)}{thread.body.length > 120 ? '...' : ''}</div>
            <div style={{ fontSize: 13, color: '#888' }}>By: {typeof thread.createdBy === 'object' ? thread.createdBy.name || thread.createdBy.email : 'Unknown'} | {new Date(thread.createdAt || '').toLocaleString()}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Tags: {thread.tags.join(', ')}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThreadList; 