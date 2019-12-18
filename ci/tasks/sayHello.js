const gulp = require('gulp');
/** logger */
const log = require('fancy-log');

/**
 * Gulp configuration
 */
gulp.task('say-hello', (done) => {
  log('hello!');
  done();
});