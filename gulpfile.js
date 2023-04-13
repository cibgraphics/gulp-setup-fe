'use strict';

const {src, dest, watch, series, parallel} = require('gulp');

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const prefix = require('gulp-autoprefixer');
const minify = require('gulp-clean-css');
const terser = require('gulp-terser');
const imagemin = require('gulp-imagemin');
const imagewebp = require('gulp-webp');
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const svgstore = require('gulp-svgstore');
const connect = require('gulp-connect');


// Create Functions

function compilescss(){
  return src('./app/assets/scss/style.scss')
    .pipe(sass())
    .pipe(prefix())
    .pipe(minify())
    .pipe(dest('./build/assets/css'))
    .pipe(connect.reload())
}

function jsmin(){
  return src('./app/assets/js/app.js')
    .pipe(terser())
    .pipe(dest('./build/assets/js'))
    .pipe(connect.reload())
}

function optimiseimg(){
  return src('./app/assets/images/*.{jpg,png}')
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 80, progressive: true, }),
      imagemin.optipng({ optimizationLevel: 2 })
    ]))
    .pipe(dest('./build/assets/images'))
    .pipe(connect.reload())
}

function webpImage() {
  return src('./build/assets/images/*.{jpg,png}')
    .pipe(imagewebp())
    .pipe(dest('./build/assets/images'))
    .pipe(connect.reload())
}

function compilePug() {
  return src('./app/views/pages/*.pug')
    .pipe(pug())
    .pipe(dest('./build'))
    .pipe(connect.reload())
}

function svgMap() {
  return src('./app/assets/svg/*.svg')
    .pipe(rename({prefix: 'icon-'}))
    .pipe(svgstore())
    .pipe(rename({
        basename: "svg-sprite"
      }))
    .pipe(dest('./build/assets/svg'))
    .pipe(connect.reload())
}

function serveTask() {
  connect.server({
    root: 'build',
    livereload: true,
    port: 8000,
  });
}



// Create Watchtask

function watchTask(){
  watch('./app/assets/scss/**/*.scss', compilescss);
  watch('./app/assets/js/**/*.js', jsmin);
  watch('./app/assets/images/**/*.{jpg,png}', optimiseimg);
  watch('./build/assets/images/**/*.{jpg,png}', webpImage);
  watch('./app/views/**/*.pug', compilePug);
  watch('./app/assets/svg/**/*.svg', svgMap);
}


// Run Gulp Tasks

exports.default = series(
  compilescss,
  jsmin,
  optimiseimg,
  webpImage,
  compilePug,
  svgMap,
  gulp.parallel(serveTask, watchTask)
);