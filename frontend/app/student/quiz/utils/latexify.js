export function latexify(input) {
    if (input) {
      const regularExpression = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\$\\]*(?:\\.[^\$\\]*)*\$/g;
      const blockRegularExpression = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]/g;
      const graphicExpression = /\\includegraphics\[[^\]]*\]\{[^\}]*\}/gm;
      const graphicsFileExpression = /\\includegraphics(?:\[[^\]]*\])?\{([^\}]+)\}/gm;
      const stripDollars = (stringToStrip) => (stringToStrip[0] === "$" && stringToStrip[1] !== "$" ? stringToStrip.slice(1, -1) : stringToStrip.slice(2, -2));
  
      const getDisplay = (stringToDisplay) => (stringToDisplay.match(blockRegularExpression) ? true : false);
  
      const result = [];
      const rawString = input;
      const latexMatch = rawString.replace(/\n\r|\n|\r/gm, "").match(regularExpression);
      const stringWithoutLatex = rawString.replace(/\n\r|\n|\r/gm, "").split(regularExpression);
  
      if (latexMatch) {
        stringWithoutLatex.forEach((s, index) => {
          const graphicsMatch = s.match(graphicExpression);
          const stringMatch = s.split(graphicExpression);
          stringMatch.forEach((g, r) => {
            const lineBreaks = g.match(/\\\\/g);
            const lines = g.split(/\\\\/g);
            if (lineBreaks) {
              lines?.forEach((l, n) => {
                result.push({
                  content: l,
                  type: "text",
                  display: false,
                  line_break: false,
                });
                if (lineBreaks[n]) {
                  result.push({
                    content: "",
                    type: "text",
                    display: false,
                    line_break: true,
                  });
                }
              });
            } else {
              result.push({
                content: g,
                type: "text",
                display: false,
                line_break: false,
              });
            }
  
            if (graphicsMatch && graphicsMatch[r]) {
              result.push({
                content: graphicsMatch[r].replace(graphicsFileExpression, "$1"),
                type: "graphics",
                display: true,
                line_break: true,
              });
            }
          });
          if (latexMatch[index]) {
            result.push({
              content: stripDollars(latexMatch[index]),
              type: "math",
              display: getDisplay(latexMatch[index]),
              line_break: getDisplay(latexMatch[index]),
            });
          }
        });
      } else {
        const lineBreaks = rawString.match(/\\\\/g);
        const lines = rawString.split(/\\\\/g);
        if (lineBreaks) {
          lines?.forEach((l, n) => {
            result.push({
              content: l,
              type: "text",
              display: false,
              line_break: false,
            });
            if (lineBreaks[n]) {
              result.push({
                content: "",
                type: "text",
                display: false,
                line_break: true,
              });
            }
          });
        } else {
          result.push({
            content: rawString,
            type: "text",
            display: false,
            line_break: false,
          });
        }
      }
      return result;
    }
    return [];
  } 