"use strict";
var gulp = require("gulp");
var autoprefixer = require("autoprefixer");
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');

var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var mqpacker = require("css-mqpacker");
var imagemin = require("gulp-imagemin");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var svgmin = require("gulp-svgmin")
var svgstore = require("gulp-svgstore");
var cleanCSS = require ('gulp-clean-css');
var gcmq = require('gulp-group-css-media-queries');
var run = require("run-sequence");
var del = require("del");
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var rigger = require('gulp-rigger');
var browserSync = require("browser-sync");
var reload = browserSync.reload;
var server = require("browser-sync").create();



var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/style.styl',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.styl',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil",
    notify: false,
    open: true,
    cors: true,
    ui: false
};


gulp.task("style", function() {
	return gulp.src(path.src.style)
 // gulp.src("src/less/style.less")

    .pipe(plumber())
    .pipe(sourcemaps.init())
    //.pipe(less())    
    .pipe(stylus())
    .pipe(gcmq())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
       sort: true
       }),
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(cleanCSS())
   // .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
    //.pipe(server.stream());
});



gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
]))
    .pipe(gulp.dest("build/img"))
    .pipe(reload({stream: true}));;
});

/*gulp.task("copy", function() {
 return gulp.src([
 path.src.fonts,
 path.src.img,
 path.src.js,
 path.src.html
 ], {
 base: "."
 })
 .pipe(gulp.dest("build"));
});*/


gulp.task("symbols", function() {
 return gulp.src("build/img/*.svg")
 .pipe(svgmin())
 .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("symbols.svg"))
 .pipe(gulp.dest("build/img"));
});

gulp.task('html:build', function () {
    gulp.src(path.src.html) 
        .pipe(rigger())
        .pipe(gulp.dest('build/'))
        .pipe(reload({stream: true}));
});

/*
gulp.task("html:copy", function() {
 return gulp.src(path.src.html)
 .pipe(rigger())
 .pipe(gulp.dest(path.build.html));
});

gulp.task("html:update", ["html:copy"], function(done) {

	 .pipe(reload({stream: true}))
 //server.reload();
 done();
});*/


gulp.task("clean", function() {
 return del("build");
});


/*gulp.task("serve", function() {
  server.init({
    server: "./build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

 // gulp.watch("src/less/**//*.less", ["style"]);
 	gulp.watch("src/**//*.styl", ["style"]);
  gulp.watch("src/*.html", ["html:update"]);
 // gulp.watch("src/**//*.jade", ["jade:update"]);
});*/

gulp.task("build", function(fn){
 run(
  "clean",
   "html:build",
  // "jade",
   "style",
   "js:build",
   "symbols",
   "images",
 fn
 );
});


gulp.task('serve', ['watch'], function () {
    browserSync(config);
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        server.reload(); //И перезагрузим сервер
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

/*
попытка подключить jade. правда мне не удалось сделать так, чтоб при найденной 
ошибке процесс serve не вылитал..


gulp.task("jade:update",["jade"], function(done) {
	server.reload();
  done();
});

gulp.task("jade", function() {
    return gulp.src('src/**//*.jade')
    		 .pipe(plumber())
       /* .pipe(jade()) 
        .pipe(gulp.dest('build/')); // указываем gulp куда положить скомпилированные HTML файлы
        server.reload();
        done();
});*/


