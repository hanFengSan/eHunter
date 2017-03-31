var gulp = require('gulp');
var exec = require('child_process')
    .exec;
var del = require('del');
var webpackStream = require('webpack-stream');
var webpack = require("webpack");
var gutil = require("gulp-util");
var highlight = require('gulp-highlight');

gulp.task('clean', function() {
    return del('../dist/**', { force: true });
})

gulp.task('assets', ['clean'], function() {
    gulp.src('../src/manifest.json')
        .pipe(gulp.dest('../dist/'));
    gulp.src('../src/assets/img/*')
        .pipe(gulp.dest('../dist/img'));
})

gulp.task('dev', ['assets'], function() {
    return gulp.src('../src/main.inject.js')
        .pipe(webpackStream(require('./webpack.dev.conf.js'), webpack))
        .on('error', function handleError() {
            this.emit('end'); // Recover from errors
        })
        .pipe(gulp.dest('../dist/'));
});

gulp.task('build', ['assets'], function() {
    return gulp.src('../src/main.inject.js')
        .pipe(webpackStream(require('./webpack.prod.conf.js'), webpack))
        .pipe(gulp.dest('../dist/'));
});

gulp.task('publish', ['build'], function() {
    exec('web-ext build -s ../dist -a ../publish_output');
})

gulp.task('default', function() {
});
