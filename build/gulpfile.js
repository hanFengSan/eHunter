var gulp = require('gulp');
var exec = require('child_process').exec;
var del = require('del');
// var webpack = require('webpack-stream');
var webpack = require("webpack");
var gutil = require("gulp-util");

gulp.task('clean', function () {
  return del('../dist/**', { force: true });
})

gulp.task('assets', ['clean'], function () {
  gulp.src('../src/manifest.json')
    .pipe(gulp.dest('../dist/'));
  gulp.src('../src/assets/icon.png')
    .pipe(gulp.dest('../dist/img'));
})

gulp.task('dev', ['assets'], function () {
  webpack(require('./webpack.dev.conf.js'), function (err, stats) {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      // output options
    }));
    console.log('webpack completed, ' + (new Date()).toLocaleString());
  });
});

gulp.task('default', function () {
  // 将你的默认的任务代码放在这
});