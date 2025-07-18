import React, { useEffect, useRef } from 'react';

// Utility to split LaTeX into math and non-math parts
function splitLatexAndHtml(input) {
  // Regex to match math blocks: $$...$$, \[...\], $...$, \(...\)
  const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\$\\]*(?:\\.[^\$\\]*)*\$)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'html', content: input.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'math', content: match[0] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < input.length) {
    parts.push({ type: 'html', content: input.slice(lastIndex) });
  }
  return parts;
}

// Preprocess \includegraphics to <img> with very large, card-filling size
function preprocessImages(str) {
  return str.replace(/\\includegraphics(\[.*?\])?\{(.*?)\}/g, (_, options, url) => {
    const widthMatch = options?.match(/width=([\d.]+)cm/);
    // Use a much larger default width, but allow custom width if specified
    const widthPx = widthMatch ? `${parseFloat(widthMatch[1]) * 37.8 * 2}px` : '95%';
    return `<div style="display: flex; justify-content: center; margin: 32px 0;">
      <img src="${url}" style="max-width: 95vw; min-width: 400px; width: ${widthPx}; max-height: 600px; height: auto; border-radius: 16px; box-shadow: 0 4px 32px #e0e7ef; background: #fff; object-fit: contain;" />
    </div>`;
  });
}

const LatexPreviewer = ({ value }) => {
  const previewRef = useRef(null);

  useEffect(() => {
    if (!previewRef.current) return;
    // Only typeset math spans
    if (window.MathJax && window.MathJax.typesetPromise) {
      const mathSpans = previewRef.current.querySelectorAll('.mathjax-latex');
      if (mathSpans.length > 0) {
        window.MathJax.typesetPromise(Array.from(mathSpans));
      }
    }
  }, [value]);

  const preprocessed = preprocessImages(value || "");
  const parts = splitLatexAndHtml(preprocessed);

  return (
    <span ref={previewRef}>
      {parts.map((part, i) =>
        part.type === 'math' ? (
          <span key={i} className="mathjax-latex">{part.content}</span>
        ) : (
          <span key={i} dangerouslySetInnerHTML={{ __html: part.content }} />
        )
      )}
    </span>
  );
};

export default LatexPreviewer; 