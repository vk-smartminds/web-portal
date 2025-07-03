/*

1. Import dependencies:
   - 'node-fetch' is used to make HTTP requests (like a browser fetch).
   - 'cheerio' is used to parse and query HTML (like jQuery for Node.js).
*/
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/*
2. Export an async function getCbseUpdates to handle the API request.
*/
export const getCbseUpdates = async (req, res) => {
  try {
    /*
    3. Make a GET request to the CBSE updates page.
       - The headers spoof a real browser (User-Agent, Accept, Accept-Language) to avoid basic bot-blocking.
       - This fetches ONLY the updates page: https://www.cbse.gov.in/cbsenew/cbse.html
         (not the whole CBSE website, just this specific updates/listing page)
       - We know the updates are on this page because:
         a) This URL is the official "Latest @ CBSE" or "Updates" page, as linked from the CBSE homepage.
         b) When you visit this URL in a browser, you see all the latest circulars, notices, date sheets, etc.
         c) The HTML structure (a <ul> with many <li> and <a> tags) contains all the update links and titles.
       - The code parses this page and extracts all update links and titles from the main list.
    */
    const response = await fetch('https://www.cbse.gov.in/cbsenew/cbse.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    /*
    4. Read the HTML content from the response.
    */
    const html = await response.text();

    /*
    5. Load the HTML into cheerio so we can use jQuery-like selectors.
    */
    const $ = cheerio.load(html);

    /*
    6. Prepare an array to store updates.
    */
    let updates = [];

    /*
    7. Try to find the first <ul> with many <li> children (usually the updates list).
       - For each <ul> in the page, check if it has more than 5 <li> (likely the updates section).
       - For each <a> inside that <ul>, extract the text and link.
       - If the link is relative (doesn't start with http), make it absolute by prefixing the CBSE site URL.
       - Push an object { title, link } to the updates array.
       - Set found=true and break the loop after the first matching <ul>.
    */
    let found = false;
    $('ul').each((i, ul) => {
      const lis = $(ul).find('li');
      if (lis.length > 5) { // likely the updates list
        $(ul).find('a').each((j, el) => {
          let link = $(el).attr('href') || '';
          if (link && !link.startsWith('http')) {
            link = 'https://www.cbse.gov.in/cbsenew/' + link.replace(/^\//, '');
          }
          updates.push({
            title: $(el).text().trim(),
            link
          });
        });
        found = true;
        return false; // break out of .each
      }
    });

    /*
    8. Fallback: If no updates found, try all <a> tags on the page whose text looks like an update.
       - For each <a>, if its text contains keywords like "date sheet", "circular", "notice", or "press release", treat it as an update.
       - Again, make the link absolute if needed and push to updates.
    */
    if (!found || updates.length === 0) {
      $('a').each((i, el) => {
        const text = $(el).text().trim();
        let link = $(el).attr('href') || '';
        if (text && (text.toLowerCase().includes('date sheet') || text.toLowerCase().includes('circular') || text.toLowerCase().includes('notice') || text.toLowerCase().includes('press release'))) {
          if (link && !link.startsWith('http')) {
            link = 'https://www.cbse.gov.in/cbsenew/' + link.replace(/^\//, '');
          }
          updates.push({ title: text, link });
        }
      });
    }

    /*
    9. Remove duplicate updates by combining link and title as a unique key.
    */
    const seen = new Set();
    updates = updates.filter(u => {
      const key = (u.link || '') + (u.title || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    /*
    10. Send the updates array as JSON response.
    */
    res.json({ updates });
  } catch (err) {
    /*
    11. If any error occurs (network, parsing, etc.), send a 500 error with the error message.
    */
    res.status(500).json({ message: 'Failed to fetch CBSE updates', error: err.message });
  }
};

/*
This method is called web scraping.
Your backend code "scrapes" (fetches and extracts) data from another website (CBSE).
Then, it sends the cleaned data to your own website/frontend to display.
So, you are using web scraping in your backend to fetch and show CBSE updates on your website.
*/
/*
Note:
- Anyone can view the HTML source code of any public web page by visiting it in a browser and using "View Page Source" or browser developer tools.
- This shows the HTML, CSS, and client-side JavaScript as sent by the server.
- However, backend/server-side code (like Node.js, Python, PHP, Java, etc.) is NOT visible to users—only the output (HTML) generated by the server is sent to the browser.
- The code in this controller fetches the public HTML of the CBSE updates page, just like a browser would.
*/







