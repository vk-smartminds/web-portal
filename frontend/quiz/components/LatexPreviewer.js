import React, { useEffect, useRef } from 'react';
import { latex2Html } from '../utils/latex/latex2html';

const LatexPreviewer = ({ value, images = [] }) => {
  const previewRef = useRef(null);

  useEffect(() => {
    let attempts = 0;
    let maxAttempts = 10;
    let delay = 200;
    function tryTypeset() {
      attempts++;
      if (typeof window !== 'undefined' && window.MathJax && previewRef.current) {
        console.log('[LatexPreviewer] MathJax found, typesetting node', previewRef.current);
        window.MathJax.typesetPromise([previewRef.current])
          .catch((err) => {
            console.error('[LatexPreviewer] MathJax typesetting error:', err);
            // fallback: try typesetting whole document
            if (window.MathJax && window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise()
                .then(() => console.log('[LatexPreviewer] Fallback: typeset whole document'))
                .catch(e => console.error('[LatexPreviewer] Fallback error:', e));
            }
          });
      } else if (attempts < maxAttempts) {
        console.log('[LatexPreviewer] MathJax not ready, retrying', attempts);
        setTimeout(tryTypeset, delay);
      } else {
        console.warn('[LatexPreviewer] MathJax not found after retries');
      }
    }
    tryTypeset();
  }, [value]);

  return (
    <span
      ref={previewRef}
      dangerouslySetInnerHTML={{ __html: latex2Html(value, images) }}
    />
  );
};

export default LatexPreviewer; 