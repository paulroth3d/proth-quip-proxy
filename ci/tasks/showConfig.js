/**
 * shows the current values of the config object
 */

const gulp = require('gulp');
const log = require('fancy-log');
const GulpConfig = require('../gulpConfig');

gulp.task('show:config', (done) => {
  log(JSON.stringify(GulpConfig, null,2));
  done();
});
