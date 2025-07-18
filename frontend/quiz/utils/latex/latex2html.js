import { latexify } from "./latexify";

export function latex2Html(input, images = []) {
  try {
    const FILES = [...images];
    if (input) {
      // Preprocess \includegraphics to <img> before parsing
      const preprocessed = input.replace(/\\includegraphics(\[.*?\])?\{(.*?)\}/g, (_, options, url) => {
        const widthMatch = options?.match(/width=([\d.]+)cm/);
        const widthPx = widthMatch ? `${parseFloat(widthMatch[1]) * 37.8}px` : '100px';
        return `<img src="${url}" style="width: ${widthPx}; vertical-align: middle;" />`;
      });
      // If preprocessed contains <img, split and render as raw HTML for those parts
      if (preprocessed.includes('<img')) {
        // Split on <img and keep the tag
        const parts = preprocessed.split(/(<img[^>]*>)/g);
        return parts.map(part => {
          if (part.startsWith('<img')) return part;
          // Pass non-img parts to latexify/MathJax
          const parsed = latexify(part);
          return parsed?.map((p) => {
            if (p.type === "text" && !p.line_break) return p.content;
            if (p.type === "text" && p.line_break) return "<br/>"; 
            if (p.type === "math" && !p.display) return `\\(${p.content}\\)`;
            if (p.type === "math" && p.display) return `<div class=\"text-center my-2\">\\[${p.content}\\]</div>`;
            return "";
          }).join("");
        }).join("");
      }
      // Fallback: no <img>, process as before
      const parsed = latexify(preprocessed);
      const result = parsed
        ?.map((p, i, arr) => {
          if (p.type === "text" && !p.line_break) {
            return p.content;
          }
          if (p.type === "text" && p.line_break) {
            return "<br/>";
          }
          if (p.type === "math" && !p.display) {
            return `\\(${p.content}\\)`; // Inline math
          }
          if (p.type === "math" && p.display) {
            return `<div class=\"text-center my-2\">\\[${p.content}\\]</div>`; // Display math
          }
          return "";
        })
        .join("");
      return result;
    }
    return "";
  } catch (error) {
    console.error("Error in latex2Html:", error);
    return input; // Fallback to raw input
  }
} 