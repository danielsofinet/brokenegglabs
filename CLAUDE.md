# Broken Egg Labs — brokenegglabs.com

Daniel's own studio portfolio site (originally built ~2021/2022 in WordPress, exported
to static HTML, hosted on Firebase). Migrated to **Vercel + GitHub** (push to `main`
auto-deploys). Custom domain DNS is managed in Squarespace.

## How it's built now
- **Plain static HTML/CSS** — no build step. Open any `.html` directly or serve the folder.
- Pages: `index.html` (home), `pr.html` (About), `cs.html` (Work), `contact.html`,
  and `projects/*.html` (atelia, combet, el, minot-vin, remace-active).
- `css/main.css` — the original theme CSS (large, kept). `css/bke.css` — our clean
  additions + overrides.
- `js/bke.js` — our clean vanilla JS (no dependencies). This is the ONLY app script
  besides the SproutVideo player API.

## What bke.js does (replaced the old 516KB WordPress/jQuery/ASScroll bundle)
- **Client-side router**: intercepts internal `.html` link clicks, fetches the page,
  swaps the `<main data-barba="container">` content. The URL bar never changes (stays
  at `/`), so the whole thing feels like one app. Relative asset URLs in fetched pages
  are absolutized against their source path so images/videos resolve no matter where
  the content is injected.
- **Circular page transition** (`.bke-trans`): a clip-path circle expands from the
  click point in the destination page's bg colour, then fades to reveal the new page.
  This reproduces the brand's signature circle reveal (was Barba.js before).
- **Auto-hide header**: folds up on scroll down, drops back on scroll up.
- **Contact modal**: on-brand cream card form. Submits to **Web3Forms** which emails
  daniel.sofinet@gmail.com. Triggered by any `[data-contact]` element or `mailto:` link.
  The CONTACT nav link still goes to the contact PAGE; the on-page CTAs open the modal.
- **Process slider** (About page `#sectionPin`): drag-to-scroll horizontal strip
  (replaced the dead GSAP pin-scroll). Mouse drag + wheel + touch.
- **Progressive video autoplay**: videos play when scrolled into view (IntersectionObserver),
  muted, `preload="metadata"` so the page stays light.

## Important: the old theme JS is gone
The WordPress `main.js` ran **ASScroll** (smooth scroll) and an intro preloader. Both
are removed. `css/bke.css` neutralizes them: `.pre-load`/`.swipe`/`.cursor` hidden,
`.asscroll-container` un-fixed, `.main-wrap` forced visible, native scrolling restored.
If a page ever renders blank or won't scroll, check those overrides in `bke.css`.

## Media
- Images compressed with `sips`. Videos compressed with `ffmpeg` (libx264, `-an` no
  audio, `+faststart`) and live in `assets/video/`.

## Contact form
- Web3Forms access key is in `js/bke.js` (`ACCESS_KEY`). Public by design (it only lets
  the form post to the configured inbox). Delivery target: daniel.sofinet@gmail.com.

## Deploy
- `git push` to `main` → Vercel builds and deploys. Vercel deployment protection (SSO)
  must stay OFF or visitors get a login wall.

See `.claude/` for session handoff notes.
