# 8,477 - The Hidden Data Story of Indian Railways

**[View the live site →](#)**

A scrollytelling data story that turns a 122-page government PDF into 128 verified, factual
insights about Indian Railways - and, through it, about India itself: the extreme inequality
between station tiers, the geography of who's connected and who isn't, the language embedded in
station names, station-code trivia, and a data-integrity mystery hiding inside the government's
own spreadsheet.

## About the project

Indian Railways publishes an official list of every station in the country - 8,477 of them, as of
December 2022. On the surface it's just a name, a code, and a category. Underneath, it turns out to
encode a lot about how modern India actually works: which regions got built up and which were left
behind, how a bureaucracy of 66 separate divisions leaves fingerprints in its own data, and how a
single spreadsheet can both undercount and overstate itself at the same time.

This project parses that source PDF into clean, structured data, mines it for verifiable facts, and
presents the strongest of them as a scroll-driven visual narrative - inspired by long-form data
journalism (NYT, The Pudding, Reuters Graphics) but built from scratch with no proprietary
scrollytelling framework.

The story runs in eight acts:

1. **Scale** - 16 zones, 66 divisions, one deeply uneven country
2. **The long tail** - how a handful of "elite" stations coexist with thousands of near-empty halts
3. **Where India doesn't reach** - states and districts the network barely touches
4. **The elite, concentrated** - why a handful of cities dominate the top tier
5. **The language of the rails** - naming patterns hidden in 8,477 names
6. **Fossils in the code** - quirks of the station-code system
7. **The detective story** - proving the official count is off, and why
8. **One hundred and twenty-eight small stories, in full** - every remaining fact, laid out as a roll call

## Tech stack

- **D3.js v7** (loaded via CDN) - all charts: horizontal bar charts, a log-scale word-frequency
  chart, a per-letter code chart, and an 8,477-cell dot matrix rendered as individual SVG rects
- **Vanilla JavaScript** - no framework. The entire page (all 8 acts, 72 narrative steps, 56 roll-call
  cards) is generated at runtime from two JSON files, so content and layout stay decoupled
- **IntersectionObserver API** - drives the scrollytelling mechanics: which narrative step is
  "active" as you scroll, which chart highlights change, and the fade-in for the roll-call grid
- **Plain CSS** - dark theme, CSS Grid for the sticky-chart / scrolling-text layout and the
  roll-call card wall, no CSS framework
- **Python (pandas + pdfplumber)** - offline data pipeline: extracted the source PDF's tables page
  by page, cleaned and validated ~8,477 rows, and computed every statistic that appears in the story
- No build tooling, no bundler, no npm dependencies at runtime - it's static files you can open
  directly or serve from any host

## Files

- `index.html` - page shell (hero, story container, outro)
- `style.css` - dark theme, scrollytelling layout, responsive breakpoint for mobile
- `script.js` - builds the entire story from data, draws all D3 visuals, handles scroll-triggered
  highlighting and the roll-call fade-in
- `data/facts.json` - all 128 facts, tagged by act
- `data/aggregates.json` - precomputed chart data (category/zone/state counts, word frequencies, etc.)

## Run locally

```
python3 -m http.server 8000
```
then open http://localhost:8000

## Data source

Ministry of Railways, "Station Name - 8,477" (PDF, December 2022), 122 pages, parsed with
`pdfplumber` into a clean CSV/JSON. Every fact in the story is computed directly from that data - 
nothing here is estimated or guessed.

Original source: https://indianrailways.gov.in/railwayboard/uploads/directorate/traffic_comm/Station_Name_8477.pdf
