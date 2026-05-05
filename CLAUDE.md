# CLAUDE.md — spxp-web

The official website for the [Social Profile Exchange Protocol](https://spxp.org).

## Tech Stack

- **Templating:** Panini (Handlebars-based, via Gulp)
- **CSS:** Tailwind CSS v4 (pre-built via Gulp — NOT CDN)
- **Build:** Gulp
- **Fonts:** Inter (sans) + JetBrains Mono (mono) — **self-hosted** as woff2 in `src/assets/fonts/`
- **Syntax Highlighting:** Prism.js

## Development

```bash
npm install
npm run dev    # localhost:3000 with live reload
npm run build  # → dist/
```

## Project Structure

```
src/
  layouts/modern.html     # Main layout (Tailwind + OG tags + JSON-LD)
  pages/                  # Page content (Handlebars/Panini)
    index.html            # Homepage → dist/index.html
    quickstart.html       # → dist/quickstart/index.html
    why.html              # → dist/why/index.html
    how-it-works.html     # → dist/how-it-works/index.html
    ecosystem.html        # → dist/ecosystem/index.html
  partials/
    nav.html              # Top navigation
    footer.html           # Footer
  css/tailwind.css        # Tailwind entry point + @font-face declarations
  assets/fonts/           # Self-hosted woff2 font files (latin subset)
    inter-latin.woff2
    jetbrains-mono-latin.woff2
  data/                   # Panini data files (JSON/YAML) — currently empty/unused
profile/                  # All files copied to dist/ as-is
  spxp                    # Profile JSON endpoint (no extension)
  spxp-posts              # Posts endpoint
  robots.txt
  sitemap.xml
  og-image.png
  spxp-profile-logo.png
src/.htaccess             # Copied to dist/ — enables clean URLs on the server
gulpfile.js               # Build tasks incl. copyFonts
tailwind.config.js        # VESTIGIAL — not used by Tailwind v4 (config is in tailwind.css)
dist/                     # Build output (gitignored)
```

**Routing convention:** `index.html` stays at root. All other pages become `<pagename>/index.html`
in dist (clean URLs, no .html extension in browser).

## ⚠️ Do Not Break

- **`profile/` files are critical** — they expose spxp.org as a live SPXP node. File names
  (`spxp`, `spxp-posts`) must stay exactly as-is; external clients depend on these URLs.
- **Self-hosted fonts** — do NOT reintroduce `<link>` tags to `fonts.googleapis.com` or
  `fonts.gstatic.com`. Google Fonts were removed for GDPR compliance (LG München I, Jan 2022).
  The `@font-face` declarations live in `tailwind.css`, fonts served from `/assets/fonts/`.

## Tailwind / Styling

**SPXP Custom Colors** (use these, not arbitrary hex):
```
bg-spxp-dark      #0a0a0f  — main background
bg-spxp-darker    #050508  — deeper background (cards, code blocks)
text-spxp-accent  #6366f1  — indigo accent (links, highlights, CTAs)
text-spxp-green   #22c55e  — green (status, success, terminal prompts)
text-spxp-muted   #6b7280  — muted text (secondary info)
```

**Font classes:**
- `font-sans` → Inter (body text)
- `font-mono` → JetBrains Mono (code, terminal blocks)

Dark mode is enabled via `class` strategy. `<html>` always has `class="dark"`.

## Deployment

Push to `master` → GitHub Actions → auto-deploys to **spxp.org** via SFTP.
Credentials are stored as GitHub Actions secrets (not in the repo).

## Branch & PR Convention

Use short-lived feature branches, always based off `master`:

```
feat/   — new features
fix/    — bug fixes
perf/   — performance improvements
content/ — copy/data changes only
```

Open a PR for every change; merge via GitHub. Never commit directly to `master`.

## SPXP Ecosystem

| Service | URL | Notes |
|---------|-----|-------|
| spxp.org | https://spxp.org | This repo — protocol homepage |
| HeyFolks App | https://heyfolks.app | Consumer SPXP client app |
| spxp.space | https://spxp.space | Hosted SPXP server (Java) |
| bridge.spxp.org | https://bridge.spxp.org | ActivityPub/Nostr/Bluesky bridge |
| simple-php-server | https://github.com/spxp/simple-php-server | PHP reference server implementation |

The site targets **developers first** — tone should be technical but approachable.

## Open TODOs

- [ ] **Add Impressum page** — required under German law (§ 5 TMG); link from footer
- [ ] **Screenshot: HeyFolks profile creation** — Setup flow with provider selection is missing from the Quickstart page

## Protocol Context

@../spxp-specs/CLAUDE.md
