# Roam.

Website for **Roam**, a boutique travel agency. Dark, premium, motion-rich — and still simple to navigate.

## Live site

Hosted free on GitHub Pages from the `main` branch: **https://nmgut517-arch.github.io/Roam./**

One-time setup: repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**. Every push to `main` then redeploys automatically within a minute or two.

## Forms

The trip-request form and the newsletter sign-up email submissions to the inbox in each `<form action="https://formsubmit.co/…">` via [FormSubmit](https://formsubmit.co) (free, no account).

- **First submission:** FormSubmit emails that inbox an activation link. Click it once — until then, submissions aren't delivered.
- **Change the inbox:** replace the email in both `action` attributes in `index.html`, then activate the new address the same way.
- Spam is filtered with a hidden honeypot field.

## Run it locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

Deploys as-is to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's inside

| Path | Purpose |
| --- | --- |
| `index.html` | Page markup. The logo is inlined once as an SVG sprite (`#roam-mark`, `#roam-word`) and reused everywhere. |
| `css/styles.css` | All styling. Colors, fonts and spacing live in `:root` variables at the top. |
| `js/main.js` | Interactions: preloader, scroll reveals, custom cursor, magnetic buttons, card tilt, pinned horizontal "Journeys" scroll, counters, testimonials, forms. Also draws the illustrated destination scenes. |
| `404.html` | "Off the map" page GitHub Pages shows for broken links. |
| `assets/` | Vector versions of the logo (traced from the original), favicon, and the original logo image. |

## Sections

Hero with quick trip planner → destination marquee → filterable destinations → signature journeys (horizontal scroll) → how it works → stats → stories → contact form → footer.

## Customizing

- **Brand colors:** edit `--accent`, `--accent-2` and `--bg` in `css/styles.css`.
- **Destinations / journeys:** edit the cards in `index.html`. Each card's illustration is picked by `data-scene` (`aurora`, `peaks`, `kyoto`, `coast`, `dunes`, `jungle`, plus `peaks2`, `coast2`, `dunes2`, `aurora2`).
- **Using photos instead:** replace a card's `<div class="dest__art"></div>` content with an `<img>` and remove its `data-scene` attribute.
- **Contact email:** shown in the mobile menu, contact section and footer of `index.html`.

Motion respects the visitor's *reduce motion* setting, and the custom cursor only appears on mouse/trackpad devices.
