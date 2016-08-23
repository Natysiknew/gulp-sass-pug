'use strict';

var gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    bourbon        = require('node-bourbon'),
    autoprefixer   = require('gulp-autoprefixer'),
    rename         = require('gulp-rename'),
    cleanCSS       = require('gulp-clean-css'),
    pug            = require('gulp-pug'),
    browserSync    = require('browser-sync'),
    concat         = require('gulp-concat'),
    uglify         = require('gulp-uglify'),
    cache          = require('gulp-cache'),
    imagemin       = require('gulp-imagemin'),
    pngquant       = require('imagemin-pngquant'),
    del            = require('del'),
    gulpRemoveHtml = require('gulp-remove-html'),
    htmlbeautify   = require('gulp-html-beautify'),
    prettify       = require('gulp-html-prettify');

// Browser-sync
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

// Sass compilation
gulp.task('sass', ['headersass'], function() {
  return gulp.src('sass/**/*.sass')
  .pipe(sass({
    includePaths: bourbon.includePaths
  }))
  .pipe(rename({
    suffix: '.min',
    prefix : ''
  }))
  .pipe(autoprefixer(['last 15 versions']))
  .pipe(cleanCSS())
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({stream: true}))
});

gulp.task('headersass', function() {
  return gulp.src('sass/header.sass')
  .pipe(sass({
    includePaths: bourbon.includePaths
  }).on('error', sass.logError))
  .pipe(rename({suffix: '.min', prefix : ''}))
  .pipe(autoprefixer(['last 15 versions']))
  .pipe(cleanCSS())
  .pipe(gulp.dest('pug'))
  .pipe(browserSync.reload({stream: true}))
});

// Jade
gulp.task('pug', ['pug-pages'], function() {
  return gulp.src('pug/*.jade')
  .pipe(pug())
  .pipe(gulp.dest('app'))
  .pipe(browserSync.reload({stream: true}))
});

gulp.task('pug-pages', function() {
  return gulp.src('pug/pages/*.jade')
  .pipe(pug())
  .pipe(gulp.dest('app/html'))
  .pipe(browserSync.reload({stream: true}))
});

// Html beautify - total html, css and js
gulp.task('htmlbeautify', function() {
  gulp.src('app/*.html')
    .pipe(htmlbeautify({indent_size: 2, use_config: false}))
    .pipe(gulp.dest('dist'))
});

// Html beautify - html only
gulp.task('prettify', function() {
  gulp.src('app/**/*.html')
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest('dist'))
});

// Удаление тэгов Deject и красивый html - работает только для страниц, где есть соответствующий тэг
// Для pages надо настраивать отдельно
gulp.task('buildhtml', function() {
  gulp.src(['app/*.html'])
    .pipe(gulpRemoveHtml())
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest('dist/'))
});

// JS libs minification
gulp.task('libs', function() {
  return gulp.src([
    'app/libs/jquery/dist/jquery.min.js',
    'app/libs/modernizr/modernizr.js'
    // 'app/libs/magnific-popup/magnific-popup.min.js'
  ])
  .pipe(concat('libs.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('app/js'));
});

// Watch
gulp.task('watch', ['sass', 'pug', 'libs', 'browser-sync'], function() {
  gulp.watch('sass/header.sass', ['headersass']).on("change", browserSync.reload);
  gulp.watch('sass/**/*.sass', ['sass']).on("change", browserSync.reload);
  gulp.watch('pug/pages/*.jade', ['pug-pages']);
  gulp.watch('pug/*.jade', ['pug']);
  gulp.watch('app/html/*.html').on("change", browserSync.reload);
  gulp.watch('app/*.html').on("change", browserSync.reload);
  gulp.watch('app/js/**/*.js').on("change", browserSync.reload);
});

// Images
gulp.task('imagemin', function() {
  return gulp.src('app/img/**/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dist/img'));
});

// Remove "dist" folder
gulp.task('clean', function() {
  return del.sync('dist');
});

// Сборка проекта
gulp.task('build', ['clean', 'sass', 'pug', 'buildhtml', 'imagemin', 'libs'], function() {

  var buildCss = gulp.src([
    'app/css/fonts.min.css',
    'app/css/main.min.css'
  ])
  .pipe(gulp.dest('dist/css'));

  var buildFiles = gulp.src([
    'app/.htaccess'
  ]).pipe(gulp.dest('dist'));

  var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));

  var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('dist/js'));

});


// Очистка кэша
gulp.task('clearcache', function () {
  return cache.clearAll();
});

// Дефолтный таск, выполняется по команде "gulp"
gulp.task('default', ['watch']);
