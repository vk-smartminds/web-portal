import { latexify } from "./latexify";

export function latex2Html(input, images = []) {
  try {
    const FILES = [...images];
    if (input) {
      const showImage = (filename) => {
        const FILE = FILES?.find((f) => f.name === filename)?.url;
        return FILE || `/images/${filename}.jpg`; // Fallback to local images directory
      };
      const parsed = latexify(input);
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

          if (p.type === "graphics") {
            return `<div class=\"flex justify-center my-2\"><img class=\"max-w-xs w-full h-auto\" src=\"${showImage(p.content)}\" alt=\"Diagram\" /></div>`;
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