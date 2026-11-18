# Antigravity prompts for Signify (use in order)

## 1) Open the project
You are working on "Signify", a static HTML/CSS/JS landing page that helps ordinary people use sign language. Read README.md and AGENTS.md first and follow them strictly. The site is Arabic and right-to-left; all visible text must be Arabic except the names Signify and Signy. Start a local server, open the site, and confirm that: the map section appears before the Signy chatbot section, the placeholder map shows, 3 sample hotspots pulse on it, clicking one opens a video modal (it will say "Video not found" until videos exist), and Signy answers from data/qa.js. List anything broken and fix it. Do not change the design yet.

## 2) Verify the map hotspots
The map (assets/map/map.jpg) already has 5 hotspots in data/hotspots.js (University Hall, City General Hospital, Medical Records, Oak Street Mini-Market, and the west Metro stop). Open the page and, on desktop and at 390px mobile width, confirm every pin sits exactly on its icon on the map and that pins don't overlap labels badly. Fix any x/y percentages that are off. Keep titles and descriptions in Arabic. Do not add or remove hotspots unless I ask. Read assets/videos/VIDEOS-CHECKLIST.md to see which video file each hotspot expects.

## 3) Videos in the hotspots
I will upload videos for the hotspots into assets/videos/. When I do: match each file to its hotspot by file name or by asking me, set the "video" path in data/hotspots.js, and rename files to lowercase with dashes and no spaces if needed. Then open every hotspot in the browser and confirm each video loads and plays. If a video won't play, check the codec (convert to mp4 H.264/AAC with ffmpeg if available), the path, and that the page is served over http (not file://), and fix it. Add a poster thumbnail only if I ask.

## 4) Signy's Q&A
Replace the content of data/qa.js with my questions and answers below (keep them in Arabic exactly as I wrote them). For each item write a good "keywords" list in BOTH Arabic and English (including common Egyptian-Arabic phrasings and typos) so natural questions match. Keep the welcome message and the fallback message in friendly Arabic and make the fallback explain that Signy only answers about sign language. Test at least 3 differently-worded questions per item and 5 off-topic questions (they must trigger the fallback). Do not add any information that is not in my answers.
[PASTE YOUR Q&A HERE]

## 5) Polish + responsive check
Review the whole page as a designer. Keep the Signify palette (CSS variables in :root). Improve spacing, hover states, focus states and accessibility (alt text, keyboard access to hotspots, color contrast). Check at 390px, 768px and 1440px widths, and make sure RTL layout is correct everywhere (chat bubbles, modal close button, nav, edit panel). Make sure the modal video fits on mobile in portrait. Don't add libraries. Summarize every change you made.

## 6) Final handoff
Create a short checklist of what I need to do before presenting: where to put new videos, how to change colors, how to edit Signy's answers, and how to share the site (zip the folder or deploy as a static site). Remove ?edit=1 dependence from any visible UI, and confirm no console errors.
