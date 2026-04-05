'use strict';
const { src, dest, watch, series } = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const panini = require('panini');
const prettyHtml = require('gulp-pretty-html');
const { exec } = require('child_process');
const path = require('path');

// BUILD TAILWIND CSS
function buildTailwind(done) {
  console.log('---------------BUILDING TAILWIND CSS---------------');
  exec(
    path.join(__dirname, 'node_modules/.bin/tailwindcss') +
      ' -i ./src/css/tailwind.css -o ./dist/css/tailwind.css --minify',
    (err, stdout, stderr) => {
      if (err) { console.error(stderr); return done(err); }
      browserSync.reload();
      done();
    }
  );
}

// COMPILE HTML WITH PANINI
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

// PRETTIFY HTML FILES
function prettyHTML() {
  console.log('---------------HTML PRETTIFY---------------');
  return src('dist/*.html')
    .pipe(prettyHtml({
      indent_size: 4,
      indent_char: ' ',
      unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
    }))
    .pipe(dest('dist'));
}

// DELETE DIST FOLDER
function cleanDist(done) {
  console.log('---------------REMOVING OLD FILES FROM DIST---------------');
  del.sync('dist');
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
  watch('src/**/*.html', series(compileHTML, prettyHTML, buildTailwind));
  watch('src/css/**/*.css', buildTailwind);
  watch('profile/**/*', copySPXPProfile);
}

// DEV - local development with live reload
exports.dev = series(cleanDist, copySPXPProfile, copyStatic, compileHTML, prettyHTML, buildTailwind, browserSyncInit, watchFiles);

// BUILD - production build
exports.build = series(cleanDist, copySPXPProfile, copyStatic, compileHTML, prettyHTML, buildTailwind);

// Default task
exports.default = exports.dev;
