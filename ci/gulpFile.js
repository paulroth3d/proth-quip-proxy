const gulp = require('gulp');
/** logger */
const log = require('fancy-log');
/** handle errors to avoid breaking */
const plumber = require('gulp-plumber');
/** support-linting */
const eslint = require('gulp-eslint');
/** support tests */
const mocha = require('gulp-mocha');

const tasks = require('./tasks');

gulp.task('default', gulp.series('say-hello'));