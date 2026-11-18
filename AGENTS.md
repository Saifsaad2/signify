# Signify — sign language for everyone

Landing page: **interactive map (first)** → **Signy chatbot**. Plain HTML/CSS/JS, no build step.

## Run it
The site now also works by double-clicking index.html (data is in .js files). A local server is still recommended for videos.
- Antigravity: use its built-in preview / run `python3 -m http.server 8000` then open http://localhost:8000
- Edit mode: http://localhost:8000/?edit=1

## Folder map
```
index.html            page structure (map section, then Signy section)
css/style.css         ALL colors are variables at the top (:root)
js/app.js             map, hotspots, video modal, edit mode
js/chatbot.js         Signy chatbot logic
data/hotspots.js    hotspot positions + video paths  <- edit this
data/qa.js          Signy's Q&A, welcome, fallback   <- edit this
assets/map/map.jpg    PUT THE NEW MAP HERE (png/jpg; rename to map.png)
assets/videos/        PUT HOTSPOT VIDEOS HERE (mp4, H.264/AAC)
assets/signy.svg      Signy's avatar
```

## How hotspots work
Each hotspot in `data/hotspots.js`: `id`, `title`, `description`, `x`, `y` (percent of map width/height), `video` (path).
Clicking a pin opens a modal and plays its video.

## Adding videos
1. Copy the file into `assets/videos/` (e.g. `hello.mp4`).
2. Set that hotspot's `"video": "assets/videos/hello.mp4"` (or use ?edit=1 -> click pin -> Video path).
Tips: mp4 (H.264 + AAC), under ~20 MB each, no spaces in file names.

## Rules for AI agents working on this repo (Antigravity)
- Keep it dependency-free static HTML/CSS/JS. Do not add a framework or build step.
- Colors only via the CSS variables in `:root` of `css/style.css`.
- Never hardcode hotspot coordinates in JS; they live in `data/hotspots.js` as percentages.
- Brand: site name **Signify**, chatbot name **Signy**. Map section stays before the chatbot section.
- Chatbot content only comes from `data/qa.js`.
- The site is **Arabic, right-to-left** (`<html lang="ar" dir="rtl">`). ALL visible text must be in Arabic. Only the names **Signify** and **Signy** stay in English (wrap them in `dir="ltr"`). The map container stays `dir="ltr"` so hotspot percentages work.
- Any new UI text, hotspot titles/descriptions, and chatbot answers must be written in clear, friendly Arabic.
- Must work on mobile.
