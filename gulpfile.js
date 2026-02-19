'use strict';
const { src, dest, watch, series } = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const panini = require('panini');
const prettyHtml = require('gulp-pretty-html');

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

// WATCH FILES
function watchFiles() {
  watch('src/**/*.html', series(compileHTML, prettyHTML));
  watch('profile/**/*', copySPXPProfile);
}

// BROWSER SYNC
function browserSyncInit(done) {
  console.log('---------------BROWSER SYNC---------------');
  browserSync.init({
    server: './dist'
  });
  return done();
}

// DEV - local development with live reload
exports.dev = series(cleanDist, copySPXPProfile, compileHTML, prettyHTML, browserSyncInit, watchFiles);

// BUILD - production build
exports.build = series(cleanDist, copySPXPProfile, compileHTML, prettyHTML);

// Default task
exports.default = exports.dev;
