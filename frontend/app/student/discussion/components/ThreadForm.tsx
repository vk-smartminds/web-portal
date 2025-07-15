import React from 'react';

interface ThreadFormProps {
  title: string;
  body: string;
  tags: string[];
  images: File[];
  onChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
}

const TAG_OPTIONS = [
  'CBSE', 'Maths', 'Chemistry', 'Physics', 'Science', 'JEE', 'NEET', 'Biology', 'English', 'Hindi', 'Social Studies',
  'History', 'Geography', 'Civics', 'Economics', 'Political Science', 'Philosophy', 'Religion', 'Art', 'Music', 'Dance',
  'Theatre', 'Film', 'Literature', 'Language', 'Communication', 'Public Speaking', 'Leadership', 'Management',
  'Entrepreneurship', 'Marketing', 'Sales', 'Customer Service', 'HR', 'Finance', 'Accounting', 'Taxation', 'Law',
  'Criminal Justice', 'Social Work', 'Psychology', 'Sociology', 'Anthropology'
];

const ThreadForm: React.FC<ThreadFormProps> = ({ title, body, tags, images, onChange, onSubmit, loading, error }) => {
  return (
    <form onSubmit={onSubmit} style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #eee', marginBottom: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Create New Thread</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => onChange('title', e.target.value)}
        required
        style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ddd', marginBottom: 12 }}
      />
      <textarea
        placeholder="Body"
        value={body}
        onChange={e => onChange('body', e.target.value)}
        required
        rows={4}
        style={{ width: '100%', padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ddd', marginBottom: 12, resize: 'vertical' }}
      />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500, marginRight: 8 }}>Tags:</label>
        <select multiple value={tags} onChange={e => onChange('tags', Array.from(e.target.selectedOptions, o => o.value))} style={{ minWidth: 180, borderRadius: 6, border: '1px solid #ddd', padding: 6 }}>
          {TAG_OPTIONS.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500, marginRight: 8 }}>Images:</label>
        <input type="file" accept="image/*" multiple onChange={e => onChange('images', Array.from(e.target.files || []))} />
        {images && images.length > 0 && <span style={{ marginLeft: 8, fontSize: 13, color: '#888' }}>{images.length} image(s) selected</span>}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: 6, background: '#0079d3', color: '#fff', fontWeight: 600, border: 'none', fontSize: 16, cursor: 'pointer' }}>{loading ? 'Posting...' : 'Post Thread'}</button>
    </form>
  );
};

export default ThreadForm; 