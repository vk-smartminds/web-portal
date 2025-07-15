import React, { useEffect, useRef } from 'react';
import { latex2Html } from '../utils/latex/latex2html';

const LatexPreviewer = ({ value, images = [] }) => {
  const previewRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.MathJax && previewRef.current) {
      window.MathJax.typesetPromise([previewRef.current]).catch((err) =>
        console.error('MathJax typesetting error:', err)
      );
    }
  }, [value]);

  return (
    <div
      ref={previewRef}
      className="prose max-w-none"
      style={{ background: '#f8fafc', borderRadius: 8, padding: 12, minHeight: 40 }}
      dangerouslySetInnerHTML={{ __html: latex2Html(value, images) }}
    />
  );
};

export default LatexPreviewer; 