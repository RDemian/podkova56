'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();

var del = require('del');
var rename = require('gulp-rename');
var svgstore = require('gulp-svgstore');
var minify = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var run = require('run-sequence');


gulp.task('clean-build', function() {
  return del('build');
});

gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/js/**',
    'source/*.html'
    ], {
      base: 'source'
    })
  .pipe(gulp.dest('build'));
});

gulp.task('style', function() {
  gulp.src('source/scss/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('images', function() {
  return gulp.src('source/img/**/*.{png,svg,jpg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('html-copy', function() {
  return gulp.src('source/*.html')
    .pipe(gulp.dest('build'));
});

gulp.task('serve', function() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/img/**/*.{png,svg,jpg}', ['images']);
  gulp.watch('source/js/*.js', ['copy']);
  gulp.watch('source/scss/**/*.scss', ['style']);
  gulp.watch('source/*.html',['html-copy']).on('change', server.reload);
  //gulp.watch('source/*.html').on('change', server.reload);
});

gulp.task('build', function(done){
  run('clean-build', 'copy', 'style', 'images', 'html-copy', done);
  //run('clean-build', 'copy', 'style', 'images', 'webp', 'sprite', 'html-include', done);
});
