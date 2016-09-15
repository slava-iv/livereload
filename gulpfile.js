var gulp = require('gulp');
var path = require('path');
var open = require('open');
var sass = require('gulp-sass');
var tinylr = require('tiny-lr');
var concat = require('gulp-concat');
var uglify = require('gulp-uglifyjs');
var rename = require('gulp-rename');
var express = require('express');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var connectLivereload = require('connect-livereload');

var expressPort = 4000;
var livereloadPort = 35729;
var paths = {
  html: './www/*.html',
  css: './www/css/*.css',
  js: './www/js/*.js',
  styles: {
    from: ['./sass/**/*.scss'],
    to: './www/css/'
  },
  scripts: {
    from: ['./app/**/*.js'],
    to: './www/js/'
  }
};

gulp.task('serve', ['watch', 'livereload'], function () {
  var app = express();
  app.use(connectLivereload({ port: livereloadPort }));
  app.use(express.static(__dirname + '/www'));
  app.listen(expressPort, '0.0.0.0');
  open('http://localhost:' + expressPort + '/' + 'index.html')
});

gulp.task('livereload', function () {
  var server = tinylr();
  server.listen(livereloadPort);

  function notify(event) {
    var fileName = path.relative(__dirname, event.path);
    server.changed({body: { files: [fileName]}});
  }

  gulp.watch(paths.html, notify);
  gulp.watch(paths.css, notify);
  gulp.watch(paths.js, notify);
});

gulp.task('styles', function () {
  return gulp.src(paths.styles.from)
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest(paths.styles.to))
    .pipe(minifyCss({ keepSpecialComments: 0 }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest(paths.styles.to));
});

gulp.task('scripts', function () {
  return gulp.src(paths.scripts.from)
    .pipe(sourcemaps.init())
    .pipe(concat('all.js'))
    .pipe(gulp.dest(paths.scripts.to))
    .pipe(uglify().on('error', function (e) { console.log(e); }))
    .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.to));
});

gulp.task('watch', ['styles', 'scripts'], function () {
  gulp.watch(paths.styles.from, ['styles']);
  gulp.watch(paths.scripts.from, ['scripts']);
});

gulp.task('default', ['serve']);
