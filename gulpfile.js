var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var clean = require('gulp-clean');

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

function getVendorFiles(rootDirectory) {
  // Bootstrap
  gulp.src([
    './node_modules/bootstrap/dist/**/*',
    '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
    '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
  ])
  .pipe(gulp.dest(rootDirectory + '/vendor/bootstrap'))

// Font Awesome
gulp.src([
    './node_modules/font-awesome/**/*',
    '!./node_modules/font-awesome/{less,less/*}',
    '!./node_modules/font-awesome/{scss,scss/*}',
    '!./node_modules/font-awesome/.*',
    '!./node_modules/font-awesome/*.{txt,json,md}'
  ])
  .pipe(gulp.dest(rootDirectory + '/vendor/font-awesome'))

// jQuery
gulp.src([
    './node_modules/jquery/dist/*',
    '!./node_modules/jquery/dist/core.js'
  ])
  .pipe(gulp.dest(rootDirectory + '/vendor/jquery'))

// jQuery Easing
gulp.src([
    './node_modules/jquery.easing/*.js'
  ])
  .pipe(gulp.dest(rootDirectory + '/vendor/jquery-easing'))

// Magnific Popup
gulp.src([
    './node_modules/magnific-popup/dist/*'
  ])
  .pipe(gulp.dest(rootDirectory + '/vendor/magnific-popup'))
}

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', getVendorFiles('.'));

// Prod - Copy third party libraries from /node_modules into /vendor
gulp.task('vendor-prod', getVendorFiles('./build'));

function getCombinerSassFilesToSingleCssFile(destination) {
  return function combineSassFilesToSingleCssFile(){
    return gulp.src('./scss/**/*.scss')
      .pipe(sass.sync({
        outputStyle: 'expanded'
      }).on('error', sass.logError))
      .pipe(gulp.dest(destination))
  }
}

function getMinifierCssFile(destination) {
  return function minifyCssFile() {
    return gulp.src([
      './css/*.css',
      '!./css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destination))
    .pipe(browserSync.stream())
  }
}

function getMinifierJsFile(destination) {
  return function minifyJsFile() {
    return gulp.src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(destination))
    .pipe(browserSync.stream());
  }
}

function getBrowserSync(destination) {
  console.log('here', destination);
  return function sync() {
    browserSync.init({
      server: {
        baseDir: destination
      }
    });
  }
}

// Prod HTML
gulp.task('html-prod', function() {
  return gulp.src([
    './index.html',
    './index.html'
  ])
  .pipe(gulp.dest('./build'))
  .pipe(browserSync.stream());
});

// Prod Images
gulp.task('img-prod', function() {
  return gulp.src([
    './img/portfolio/*.jpg',
    './img/portfolio/*.png'
  ])
  .pipe(gulp.dest('./build/img/portfolio'))
  .pipe(browserSync.stream());
});

// Compile SCSS
gulp.task('css:compile', getCombinerSassFilesToSingleCssFile('./css'));

// Compile SCSS
gulp.task('css-prod:compile', getCombinerSassFilesToSingleCssFile('./build/css'));

// Minify CSS
gulp.task('css:minify', ['css:compile'], getMinifierCssFile('./css'));

// Prod Minify CSS
gulp.task('css-prod:minify', ['css-prod:compile'], getMinifierCssFile('./build/css'));

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Prod CSS
gulp.task('css-prod', ['css-prod:compile', 'css-prod:minify']);

// Minify JavaScript
gulp.task('js:minify', getMinifierJsFile('./js'));

// Prod Minify JavaScript
gulp.task('js-prod:minify', getMinifierJsFile('./build/js'));

// JS
gulp.task('js', ['js:minify']);

// Prod JS
gulp.task('js-prod', ['js-prod:minify']);

// Default task
gulp.task('default', ['css', 'js', 'vendor']);

// Configure the browserSync task
gulp.task('browserSync', getBrowserSync("./"));

// Prod Configure the browserSync task
gulp.task('browserSync-prod', getBrowserSync("./build"));

// Dev task
gulp.task('dev', ['css', 'js', 'browserSync'], function() {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./*.html', browserSync.reload);
});

// Prod task
gulp.task('prod', ['css-prod', 'js-prod', 'img-prod', 'html-prod', 'browserSync-prod']);