# 8,477 — The Hidden Data Story of Indian Railways

A scrollytelling data story built with vanilla JS + D3.js, covering 128 verified facts mined from
the Ministry of Railways' official "Station Name — 8,477" PDF (Dec 2022): inequality between station
tiers, geography of who's connected and who isn't, naming patterns, station-code trivia, and a data-integrity
mystery hiding in the government's own spreadsheet.

## Files

- `index.html` — page structure
- `style.css` — dark theme, scrollytelling layout
- `script.js` — builds the story from data, drives D3 visuals, handles scroll-triggered highlighting
- `data/facts.json` — all 128 facts, grouped by act
- `data/aggregates.json` — precomputed chart data (category/zone/state counts, word frequencies, etc.)

No build step. No dependencies besides D3 (loaded from a CDN in `index.html`).

## Run locally

```
python3 -m http.server 8000
```
then open http://localhost:8000

## Deploy to GitHub Pages

1. Create a new GitHub repository (public).
2. Push this folder's contents to the `main` branch:
   ```
   git init
   git add .
   git commit -m "Initial commit: 8,477 data story"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages → Source → Deploy from a branch → main / (root)**.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Data source

Ministry of Railways, "Station Name — 8,477" (PDF, December 2022), 122 pages, parsed with `pdfplumber`
into a clean CSV/JSON (also included in this project's parent folder). All facts are computed directly
from that data — nothing here is estimated or guessed.
