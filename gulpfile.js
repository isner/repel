const stylus = require('gulp-stylus');
const pug = require('gulp-pug');
const fs = require('fs-extra');
const path = require('path');
const { src, dest, series } = require('gulp');

const BUILD_DIR = 'dist';

function clean (cb) {
  fs.removeSync(BUILD_DIR);
  fs.ensureDirSync(BUILD_DIR);
  cb();
}

function views (cb) {
  src('views/index.pug')
    .pipe(pug())
    .pipe(dest(BUILD_DIR));
  cb();
}

function styles (cb) {
  src('styles/styles.styl')
    .pipe(stylus())
    .pipe(dest(BUILD_DIR));
  cb();
}

function images (cb) {
  src('images/*.png')
    .pipe(dest(path.join(BUILD_DIR, 'images')));
  cb();
}

function sounds (cb) {
  src('sounds/*.{wav,aif}')
    .pipe(dest(path.join(BUILD_DIR, 'sounds')));
  cb();
}

exports.default = series(
  clean,
  views,
  styles,
  images,
  sounds
);
