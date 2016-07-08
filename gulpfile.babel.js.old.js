'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import del from 'del';
import rename from 'gulp-rename';
import watchify from 'watchify';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import assign from 'lodash.assign';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import eslint from 'gulp-eslint';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import handlebars from 'gulp-compile-handlebars';
import ftp from 'vinyl-ftp';
import fileinclude from 'gulp-file-include';
import concat from 'gulp-concat';
import minifyCss from 'gulp-minify-css';
import uglify from 'gulp-uglify';
import copy from 'gulp-copy';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import deploy from './deploy.js';

const reload = browserSync.reload;

gulp.task('serve', ['styles'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['./'],
      routes: {
        //'/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    './*.html',
    './js/vendor/*.js',
    './js/build/*.js',
    './gfx/**/*'
  ]).on('change', reload);

  gulp.watch('./css/**/*.scss', ['styles']);

  gulp.watch(['./html-source/*.html', './html-source/*.html'], ['fileinclude']);

  var watchifyJS = watchify(browserifyInstance); 
  watchifyJS.on("log", gutil.log);
  watchifyJS.on("update", function watchifyUpdate () {
    return bundleJavascriptWith(watchifyJS);
  });

  bundleJavascriptWith(watchifyJS);
});

// Create browserify instances
var browserifyInstance = browserify(assign({}, watchify.args, {
  entries: ["./js/main.js"],
  debug: true,
  transform: [babelify]
}));

// Bundle the Javascript with Browserify, transpiled with Babel
function bundleJavascriptWith (bundleInstance) {

  lintJavascript();

  return bundleInstance.bundle()
    .on('error', gutil.log.bind(gutil, "Browserify Error"))
    .pipe(source("app.browserify.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./js/build"));
}

function lintJavascript () {
  return gulp.src(["gulpfile.babel.js", "js/*.js"])
    .pipe(eslint({
      rulesPath: "./.eslintrc"
    }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}

gulp.task('styles', () => {
    return gulp.src('./css/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', sass.logError))
    .pipe(autoprefixer({browsers: ['last 4 version']}))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest('css/build'))
    .pipe(reload({ stream: true }));
});

gulp.task('fileinclude', function() {
  gulp.src(['html-source/**/*'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: './html-templates'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task("js", () => {
  return bundleJavascriptWith(browserifyInstance);
});

gulp.task('concat:js', function() {
  return gulp.src([
      './bower_components/imagesloaded/imagesloaded.pkgd.js',
      './js/vendor/ga.js',
      './js/vendor/jquery-2.1.1.min.js',
      './js/vendor/jquery.panzoom.js',
      './js/vendor/hammer.js',
      './js/vendor/mobiscroll/mobiscroll.core.js',
      './js/vendor/mobiscroll/mobiscroll.util.datetime.js',
      './js/vendor/mobiscroll/mobiscroll.widget.js',
      './js/vendor/mobiscroll/mobiscroll.scroller.js',
      './js/vendor/mobiscroll/mobiscroll.datetime.js',
      './js/vendor/mobiscroll/i18n/mobiscroll.i18n.no.js',
      './js/vendor/highcharts/highcharts.js',
      './js/plugins.js',
      './js/build/app.browserify.js'
    ])
    .pipe(concat('production.js'))
    .pipe(gulp.dest('./js/build/'));
});

// Minify JS
gulp.task('minify:js', function() {
  return gulp.src([
      './js/loader.js',
      './js/build/production.js'
    ])
    .pipe(rename(path => {
      path.extname = ".min.js";
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest('./js/build/'));
});

// Minify CSS
gulp.task('minify:css', function () {
  return gulp.src([
      './css/build/loader.css',
      './css/build/production.css'
    ])
    .pipe(rename(path => {
      path.extname = ".min.css";
    }))
    .pipe(sourcemaps.init())
    .pipe(minifyCss())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest('./css/build/'));
});

// Create new app.appcache with changed date
gulp.task("updateAppcache", function () {
  gulp.src('./app.appcache.handlebars')
    .pipe(handlebars({ changed: +new Date() }))
    .pipe(rename('app.appcache'))
    .pipe(gulp.dest('./'));
});

gulp.task('copy-to-dist', () => {
  return gulp.src([
      './js/build/**/*',
      './css/build/**/*',
      './gfx/**/*',
      './favicons/**/*',
      './app.appcache',
      './dev.html',
      './index.html',
      './404.html',
      './humans.txt',
      './robots.txt',
      './crossdomain.xml'
    ])
    .pipe(copy('./dist'));
});

//gulp.task('serve', ['styles', 'js'], () => {
//  browserSync({
//    notify: false,
//    port: 9000,
//    server: {
//      baseDir: ['./'],
//      routes: {
//        '/bower_components': 'bower_components'
//      }
//    }
//  });
//
//  gulp.watch([
//    'app/*.html',
//    'app/scripts/**/*.js',
//    'app/images/**/*',
//    '.tmp/fonts/**/*'
//  ]).on('change', reload);
//
//  gulp.watch('app/styles/**/*.scss', ['styles']);
//  gulp.watch('app/fonts/**/*', ['fonts']);
//  gulp.watch('bower.json', ['wiredep', 'fonts']);
//});
gulp.task('default', ['js', 'styles']);
gulp.task('pre-deploy', ['default', 'concat:js', 'minify:css', 'minify:js', 'fileinclude', 'updateAppcache']);

gulp.task('deploy-live', ['pre-deploy', 'copy-to-dist'], () => {
  return deploy.to('live');
});
gulp.task('deploy-test', ['pre-deploy', 'copy-to-dist'], () => {
  return deploy.to('test');
});