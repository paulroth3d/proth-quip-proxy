/**
 * Lints the project using gulp
 */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const log = require('fancy-log');

const GULP_CONFIG = require('../gulpConfig');

gulp.task('lint', () => {
  const lintPaths = GULP_CONFIG.patterns.src;
  log(`starting:lint ${lintPaths}`);
  const scriptStream = gulp.src(lintPaths)
    .pipe(plumber({
      errorHandler: (error) => {
        log.error(error.message);
        scriptStream.emit('end');
      },
    }))
    .pipe(eslint({
      configFile: filePaths.eslintConfigPath,
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  return scriptStream;
});
