import React from 'react';

export default function AVLR(props) {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: '#1e3c72' }}>
      <h2>AVLR Component Placeholder</h2>
      <p>This is a placeholder for the AVLR component.</p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
} 