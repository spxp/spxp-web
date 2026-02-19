# SPXP.org Website

The official website for the [Social Profile Exchange Protocol](https://spxp.org).

## Tech Stack

- **HTML Templating:** [Panini](https://github.com/foundation/panini) (Handlebars-based)
- **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- **Fonts:** [Inter](https://fonts.google.com/specimen/Inter) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (Google Fonts)
- **Syntax Highlighting:** [Prism.js](https://prismjs.com/) (via CDN)
- **Build Tool:** [Gulp](https://gulpjs.com/)

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/spxp/spxp-web.git
cd spxp-web

# Install dependencies
npm install

# Start development server (with live reload)
npm run dev
```

This opens `http://localhost:3000` in your browser with live reload on changes.

### Build

```bash
# Build for production
npm run build
```

Output is written to `dist/`.

## Project Structure

```
spxp-web/
├── src/
│   ├── layouts/        # Page layouts (Panini)
│   │   └── modern.html # Main layout with Tailwind config
│   └── pages/          # Page content
│       └── index.html  # Homepage
├── profile/            # SPXP profile files (copied to dist/)
│   ├── spxp            # Profile JSON
│   ├── spxp-posts      # Posts endpoint
│   └── spxp-profile-logo.png
├── dist/               # Build output (git-ignored)
├── gulpfile.js         # Build configuration
└── package.json
```

## Deployment

Pushes to `master` automatically deploy to spxp.org via GitHub Actions (SFTP).

## License

[Apache License 2.0](LICENSE)
