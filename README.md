# Anthony Bafitos — Portfolio

Cinematic 3D-scroll portfolio, styled after the Awwwards SOTY 2025 (Lando Norris) site.

## Run locally

```
cd "Anthony bafitos portolio"
python -m http.server 8080
```

Then open http://localhost:8080

(A local server is required — the hero canvas and video scrubbing use `fetch`-adjacent browser APIs that behave inconsistently under `file://`.)

## Current state

The hero orbit currently renders a **procedural placeholder** (a rim-lit silhouette that rotates as you scroll) so the scroll-scrub mechanics can be verified before real footage exists. The Three Pillars section similarly falls back to a static gradient instead of a video.

## Swapping in real Seedance footage

See `SEEDANCE_PROMPTS.md` for the exact prompts to run in DaVinci AI / Seedance 2.0.

**Hero Orbit (Clip 1) → frame sequence:**
1. Export/download the generated clip as `hero-orbit.mp4`.
2. Extract frames (needs `ffmpeg`):
   ```
   ffmpeg -i hero-orbit.mp4 -vf fps=24 assets/frames/hero/frame_%04d.jpg
   ```
3. In `js/script.js`, set `USE_REAL_HERO_FRAMES = true` and confirm `HERO_FRAME_COUNT` matches the number of frames extracted.

**The Negotiator (Clip 2) → background video:**
1. Save the generated clip as `assets/video/negotiator.mp4`.
2. In `js/script.js`, set `USE_REAL_NEGOTIATOR_VIDEO = true`.

No other code changes are needed — refresh the page.

## Content placeholders to personalize

Everything below is example content and should be swapped for the real thing directly in `index.html`:
- Stats strip numbers (suppliers managed, countries, savings %, contracts, years)
- Three Pillars descriptions
- Work section case studies (currently 3 generic procurement examples)
- CTA button links (email, résumé download)
- Footer LinkedIn URL (currently `linkedin.com/in/anthonybafitos` — confirm this is the real handle)
