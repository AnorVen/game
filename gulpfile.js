"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var imagemin = require("gulp-imagemin");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var svgmin = require("gulp-svgmin")
var svgstore = require("gulp-svgstore");
var server = require("browser-sync").create();
var cleanCSS = require ('gulp-clean-css');
var gcmq = require('gulp-group-css-media-queries');
var run = require("run-sequence");
var del = require("del");
var jade = require('gulp-jade');
var data = require('gulp-data');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');

gulp.task("style", function() {
	return gulp.src('src/**/*.styl')
 // gulp.src("src/less/style.less")
    .pipe(plumber())
    //.pipe(less())
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(gcmq())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
       sort: true
       })
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("build/css"))
    .pipe(cleanCSS())
   // .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});



gulp.task('default', function () {
    gulp.src('src/style.css')
        .pipe(gcmq())
        .pipe(gulp.dest('dist'));
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function() {
 return gulp.src([
 "fonts/**/*.{woff,woff2}",
 "img/**",
 "js/**",
 "*.html"
 ], {
 base: "."
 })
 .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
 return del("build");
});

gulp.task("symbols", function() {
 return gulp.src("build/img/*.svg")
 .pipe(svgmin())
 .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("symbols.svg"))
 .pipe(gulp.dest("build/img"));
});

gulp.task("html:copy", function() {
 return gulp.src("*.html")
 .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
 server.reload();
 done();
});

gulp.task("serve", function() {
  server.init({
    server: "./build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

 // gulp.watch("src/less/**/*.less", ["style"]);
 	gulp.watch("src/**/*.styl", ["style"]);
  gulp.watch("*src/.html", ["html:update"]);
  gulp.watch("*src/**/.jade", ["jade"]);
});

gulp.task("build", function(fn){
 run(
  "clean",
   "copy",
   "jade",
   "style",
   "symbols",
   "images",
 fn
 );
});


gulp.task("jade", function() {
    return gulp.src('src/**/*.jade')
        .pipe(jade()) 
        .pipe(gulp.dest('builds/')); // указываем gulp куда положить скомпилированные HTML файлы
        server.reload();
});

