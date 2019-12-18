const gulp = require('gulp');
/** logger */
const log = require('fancy-log');

const GulpConfig = require('../gulpConfig');

/**
 * Gulp configuration
 */
gulp.task('say-hello', (done) => {
  log(`say:${GulpConfig.default.msg}`);
  done();
});
