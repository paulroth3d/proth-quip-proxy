/**
 * Lints the project using gulp
 */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const log = require('fancy-log');

const GULP_CONFIG = require('../gulpConfig');

const lint = (done) => {
  const lintPaths = GULP_CONFIG.patterns.src;
  log(`starting:lint ${lintPaths}`);
  const scriptStream = gulp.src(lintPaths)  
    .on('end', done)
    .pipe(plumber({
      errorHandler: (error) => {
        log.error(error.message);
        scriptStream.emit('end');
      },
    }))
    .pipe(eslint({
      configFile: GULP_CONFIG.filePaths.eslintConfigPath,
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  return scriptStream;
};

gulp.task('lint', lint);

const lintWatchRunner = (done) => {
  console.log('file changed');
  lint(done);
};

gulp.task('lint:watch', () => {
  const scriptStream = gulp.watch(GULP_CONFIG.patterns.src, lintWatchRunner);

  return scriptStream;
});

module.exports = {
  lint,
  lintWatchRunner
};