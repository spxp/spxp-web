'use strict';
const { src, dest, watch, series } = require('gulp');
const browserSync = require('browser-sync').create();
const fs = require('fs');
const panini = require('panini');
const { execFile } = require('child_process');
const path = require('path');

// BUILD TAILWIND CSS
function buildTailwind(done) {
  console.log('---------------BUILDING TAILWIND CSS---------------');
  execFile(
    path.join(__dirname, 'node_modules/.bin/tailwindcss'),
    ['-i', './src/css/tailwind.css', '-o', './dist/css/tailwind.css', '--minify'],
    (err, stdout, stderr) => {
      if (err) { console.error(stderr); return done(err); }
      browserSync.reload();
      done();
    }
  );
}

// COMPILE HTML WITH PANINI
// index.html stays at root; all other pages go into subfolders as index.html
const rename = require('gulp-rename');

function compileHTML() {
  console.log('---------------COMPILING HTML WITH PANINI---------------');
  panini.refresh();
  return src('src/pages/**/*.html')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      helpers: 'src/helpers/',
      data: 'src/data/'
    }))
    .pipe(rename(function(file) {
      // Keep index.html at root, move others to subdir/index.html
      if (file.basename !== 'index') {
        file.dirname = file.basename;
        file.basename = 'index';
      }
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// COPY SPXP PROFILE FILES TO DIST
function copySPXPProfile() {
  console.log('---------------COPYING SPXP PROFILE INTO DIST FOLDER---------------');
  return src(['profile/**/*'])
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// COPY STATIC FILES (htaccess, robots, etc.)
function copyStatic() {
  console.log('---------------COPYING STATIC FILES INTO DIST FOLDER---------------');
  return src(['src/.htaccess'], { dot: true })
    .pipe(dest('dist'));
}

// COPY SELF-HOSTED FONTS TO DIST
function copyFonts() {
  console.log('---------------COPYING FONTS INTO DIST FOLDER---------------');
  return src(['src/assets/fonts/**/*'])
    .pipe(dest('dist/assets/fonts'))
    .pipe(browserSync.stream());
}

// COPY SELF-HOSTED IMAGES TO DIST
function copyImages() {
  console.log('---------------COPYING IMAGES INTO DIST FOLDER---------------');
  return src(['src/assets/images/**/*'])
    .pipe(dest('dist/assets/images'));
}

// COPY SELF-HOSTED PRISM.JS (no third-party CDN, GDPR)
function copyPrism() {
  console.log('---------------COPYING PRISM INTO DIST FOLDER---------------');
  return src([
    'node_modules/prismjs/prism.js',
    'node_modules/prismjs/components/prism-json.min.js',
    'node_modules/prismjs/components/prism-bash.min.js',
    'node_modules/prismjs/themes/prism-tomorrow.min.css'
  ])
    .pipe(dest('dist/assets/prism'));
}

// DELETE DIST FOLDER
function cleanDist(done) {
  console.log('---------------REMOVING OLD FILES FROM DIST---------------');
  fs.rmSync('dist', { recursive: true, force: true });
  return done();
}



// BROWSER SYNC
function browserSyncInit(done) {
  console.log('---------------BROWSER SYNC---------------');
  browserSync.init({
    server: './dist'
  });
  return done();
}

// WATCH FILES (including Tailwind sources)
function watchFiles() {
  watch('src/**/*.html', series(compileHTML, buildTailwind));
  watch('src/css/**/*.css', buildTailwind);
  watch('profile/**/*', copySPXPProfile);
}

// DEV - local development with live reload
exports.dev = series(cleanDist, copySPXPProfile, copyStatic, copyFonts, copyImages, copyPrism, compileHTML, buildTailwind, browserSyncInit, watchFiles);

// BUILD - production build
exports.build = series(cleanDist, copySPXPProfile, copyStatic, copyFonts, copyImages, copyPrism, compileHTML, buildTailwind);

// Default task
exports.default = exports.dev;
