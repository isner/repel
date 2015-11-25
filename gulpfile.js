
/**
 * Module dependencies.
 */

var stylus = require('gulp-stylus');
var jade = require('gulp-jade');
var fs = require('fs-extra');
var path = require('path');
var gulp = require('gulp');
var Duo = require('duo');

var BUILD_DIR = 'dist';

gulp.task('default', [
  'clean',
  'views',
  'scripts',
  'styles',
  'images',
  'sounds'
]);

gulp.task('clean', function () {
  fs.removeSync(BUILD_DIR);
  fs.ensureDirSync(BUILD_DIR);
});

gulp.task('views', function () {
  gulp.src('views/index.jade')
    .pipe(jade())
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('scripts', function () {
  Duo(__dirname)
    .entry('scripts/index.js')
    .buildTo(BUILD_DIR)
    .copy(true)
    .run(function (err, res) {
      if (err) throw err;
      fs.writeFileSync(path.join(BUILD_DIR, 'index.js'), res);
    });
});

gulp.task('styles', function () {
  gulp.src('styles/styles.styl')
    .pipe(stylus())
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('images', function () {
  gulp.src('images/*.png')
    .pipe(gulp.dest(path.join(BUILD_DIR, 'images')));
});

gulp.task('sounds', function () {
  gulp.src('sounds/*.{wav,aif}')
    .pipe(gulp.dest(path.join(BUILD_DIR, 'sounds')));
});
