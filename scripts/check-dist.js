'use strict';
// Sanity checks on the built site (dist/). Run after `npm run build`.
//  1. No third-party resources are loaded (GDPR: no CDNs, no Google Fonts)
//  2. Profile endpoints exist and are valid JSON
//  3. Every local href/src/url() resolves to a file in dist/
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const OWN_HOSTS = ['spxp.org', 'www.spxp.org'];
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const rel = (f) => path.relative(DIST, f);

// Resources the browser loads automatically (not plain <a> links)
function htmlResources(html) {
  const res = [];
  for (const m of html.matchAll(/<(script|img|iframe|source|video|audio)\b[^>]*?\bsrc=["']([^"']+)["']/gi)) {
    res.push({ url: m[2], auto: true });
  }
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const href = /\bhref=["']([^"']+)["']/i.exec(m[0]);
    const relAttr = /\brel=["']([^"']+)["']/i.exec(m[0]);
    if (!href) continue;
    // canonical/alternate are metadata, not loaded resources
    const auto = !(relAttr && /\b(canonical|alternate|author|license)\b/i.test(relAttr[1]));
    res.push({ url: href[1], auto });
  }
  for (const m of html.matchAll(/<a\b[^>]*?\bhref=["']([^"']+)["']/gi)) {
    res.push({ url: m[1], auto: false });
  }
  return res;
}

function cssResources(css) {
  const res = [];
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) res.push({ url: m[1], auto: true });
  for (const m of css.matchAll(/@import\s+["']([^"']+)["']/gi)) res.push({ url: m[1], auto: true });
  return res;
}

function resolveLocal(url, fromFile) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  const base = clean.startsWith('/') ? path.join(DIST, clean) : path.resolve(path.dirname(fromFile), clean);
  const candidates = [base, path.join(base, 'index.html')];
  return candidates.some((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ? true : false;
}

function check(file, resources) {
  for (const { url, auto } of resources) {
    if (/^(mailto:|tel:|data:|javascript:|#)/i.test(url)) continue;
    if (/^(https?:)?\/\//i.test(url)) {
      const host = new URL(url, 'https://x').hostname;
      if (auto && !OWN_HOSTS.includes(host)) {
        errors.push(`${rel(file)}: third-party resource loaded from ${host} (${url})`);
      }
      continue;
    }
    if (resolveLocal(url, file) === false) {
      errors.push(`${rel(file)}: broken local reference ${url}`);
    }
  }
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const files = walk(DIST);
for (const f of files.filter((f) => f.endsWith('.html'))) {
  check(f, htmlResources(fs.readFileSync(f, 'utf8')));
}
for (const f of files.filter((f) => f.endsWith('.css'))) {
  check(f, cssResources(fs.readFileSync(f, 'utf8')));
}

// SPXP endpoints: external clients depend on these exact URLs
for (const name of ['spxp', 'spxp-posts']) {
  const f = path.join(DIST, name);
  try {
    JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    errors.push(`${name}: ${e.code === 'ENOENT' ? 'missing' : 'invalid JSON (' + e.message + ')'}`);
  }
}

// Binary assets must be byte-identical to their sources. Gulp 5 reads files as
// UTF-8 unless `encoding: false` is set, which silently corrupts fonts/images.
const BINARY_SOURCES = [
  ['profile', ''],
  ['src/assets/fonts', 'assets/fonts'],
  ['src/assets/images', 'assets/images'],
];
const BINARY_EXT = /\.(png|jpe?g|gif|ico|woff2?|ttf)$/i;
for (const [srcDir, distDir] of BINARY_SOURCES) {
  const abs = path.join(__dirname, '..', srcDir);
  if (!fs.existsSync(abs)) continue;
  for (const f of walk(abs).filter((f) => BINARY_EXT.test(f))) {
    const out = path.join(DIST, distDir, path.relative(abs, f));
    if (!fs.existsSync(out) || !fs.readFileSync(f).equals(fs.readFileSync(out))) {
      errors.push(`${path.relative(DIST, out)}: missing or differs from ${srcDir}/${path.relative(abs, f)}`);
    }
  }
}

if (errors.length) {
  console.error(`dist check failed (${errors.length}):\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`dist check passed (${files.length} files)`);
