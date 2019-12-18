const gulp = require('gulp');
/** logger */
const log = require('fancy-log');
/** handle errors to avoid breaking */
const plumber = require('gulp-plumber');
/** support-linting */
const eslint = require('gulp-eslint');
/** support tests */
const mocha = require('gulp-mocha');

require('./tasks/sayHello');

gulp.task('default', gulp.series('say-hello'));