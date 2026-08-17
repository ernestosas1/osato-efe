# Wedding Website — Setup Guide

## 1. Fill in your details

Everything editable is in `index.html`, marked with `[bracketed placeholders]`.
Replace:

- Names, date, location (also update `data-wedding-date` in the `#countdown`
  div in `index.html` — format `YYYY-MM-DDTHH:MM:SS`, using the ceremony's
  local time)
- Our Story text
- Schedule times/locations
- Travel & Stay details
- Registry links (replace the `href="#"` on each registry button)
- Q&A answers
- Gallery: replace the six `<div class="gallery-placeholder">` tiles with
  real photos, e.g. `<img src="images/photo1.jpg" alt="...">`, and add an
  `images/` folder next to `index.html`.

## 2. Connect the RSVP form to a Google Sheet (free, no server needed)

This uses a Google Apps Script bound to a Sheet as a free form backend.
Takes about 5 minutes, entirely inside your own Google account.

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it something like "Wedding RSVPs". In row 1, add
   headers: `Timestamp | Name | Email | Attending | Notes`.
2. In that sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste this instead:

   ```javascript
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     sheet.appendRow([
       new Date(),
       e.parameter.name,
       e.parameter.email,
       e.parameter.attending,
       e.parameter.notes
     ]);
     return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

4. Click **Deploy → New deployment**. Click the gear icon next to "Select
   type" and choose **Web app**.
   - Description: "RSVP handler" (or anything)
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**. Google will ask you to authorize the script — approve
   it (it's your own script, acting on your own sheet).
6. Copy the **Web app URL** it gives you (ends in `/exec`).
7. Open `js/main.js` and paste that URL into the `RSVP_ENDPOINT` constant
   near the bottom of the file, replacing
   `'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'`.

That's it — form submissions will now append as new rows in your Sheet in
real time. You can open the Sheet any time to see responses, sort by
"Attending", count RSVPs, etc.

> If you ever edit the Apps Script code again, you must create a **new
> deployment version** (Deploy → Manage deployments → edit → New version)
> for the changes to take effect on the live URL.

## 3. Preview locally

Just open `index.html` directly in a browser, or for a closer-to-production
preview, run a tiny local server from this folder:

```bash
npx serve .
```

Then visit the URL it prints (usually `http://localhost:3000`).

## 4. Deploy for free

Easiest option — **Netlify Drop**:

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this whole folder onto the page
3. You'll get a live URL instantly (e.g. `random-name-123.netlify.app`)
4. Free Netlify account lets you rename the subdomain, or connect your own
   custom domain later if you buy one (e.g. `janeandjohn.com`)

Alternative — **GitHub Pages**: push this folder to a GitHub repo, then in
the repo's Settings → Pages, set the source to your main branch. You'll get
a URL like `yourusername.github.io/wedding`.

## 5. Nice-to-haves for later

- Add real photos to `images/` and wire up the gallery
- Add an Open Graph image/title so the link looks good when shared in texts
  (`<meta property="og:image" content="...">` in the `<head>`)
- Password-protect the site if you want to keep it private until launch
  (Netlify's free tier supports basic password protection under
  Site settings → Access control)
