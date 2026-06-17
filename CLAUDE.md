# Broken Egg Labs — brokenegglabs.com

Daniel's own studio portfolio (built ~2022 in WordPress, exported to static HTML).
Hosted on **Vercel + GitHub** (push to `main` auto-deploys). DNS in Squarespace.

## Architecture
- Plain static HTML/CSS, no build step. Serve the folder (`python3 -m http.server`).
- Pages: `index.html` (home), `pr.html` (About), `cs.html` (Work), `contact.html`,
  `projects/*.html` (atelia, combet, el, minot-vin, remace-active).
- **The original WordPress theme bundle is intentionally KEPT** — `js/main.js`
  (~516KB, minified) drives ASScroll smooth-scroll, GSAP, the intro/preloader, the
  marquees, and Barba.js page transitions. jQuery + jquery-migrate support it.
  `css/main.css` is the theme CSS. Do NOT remove these — an earlier attempt to rip
  them out and rebuild clean broke the marquees/intro/animations and was reverted.
- **Our clean layer is `js/bke.js` + `css/bke.css`** (dependency-free). This is where
  all our fixes live, layered on top without touching the minified bundle.

## What bke.js / bke.css do
- **Contact modal** → Web3Forms → daniel.sofinet@gmail.com. Opens from any
  `[data-contact]` element or `mailto:` link (capture-phase, wins over theme JS).
  The CONTACT nav link goes to the contact PAGE; on-page CTAs open the modal.
- **Clean URL**: `history.pushState/replaceState` overridden so the address bar stays
  `/` on every page (Barba loads pages by the link href, not the URL). Note: because
  of this, a hard refresh on any page returns to the homepage (expected trade-off).
- **Replacement nav** (`.bke-nav`): the original `<header>` is GSAP-pinned with inline
  `!important` transforms (uncontrollable, and folds jankily only on the homepage), so
  we hide it (`header:not(.bke-nav){visibility:hidden}`) and render our own fixed clone.
  It auto-hides on scroll down / reveals on scroll up consistently on every page, and
  recolours light/dark from the page's `data-bg` luminance. Links navigate via Barba.
- **Process slider** (`#sectionPin` on About): the original GSAP pin-scroll never
  initialises, so we drive it as a drag/wheel/swipe horizontal scroller (delegated).
- **Progressive video autoplay**: videos play on scroll into view (IntersectionObserver),
  muted, `preload="metadata"`. Local compressed files in `assets/video/`.

## Important gotchas
- **Relative asset paths + clean URL**: because the URL is forced to `/`, asset paths
  must be root-absolute or they break. Project pages use `/projects/<name>/img.jpg`
  and `/projects/<name>.html`. Keep new asset refs root-absolute.
- The minified `main.js` controls scroll/nav/transitions; you generally cannot override
  GSAP's inline `!important` transforms — work around it (as the replacement nav does)
  rather than fighting it.

## Deploy
- `git push` to `main` → Vercel builds & deploys. Keep Vercel deployment protection OFF.

See `.claude/` for session handoff notes.
