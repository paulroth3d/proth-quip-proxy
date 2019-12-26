/**
 * Lints the project using gulp
 */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');
const log = require('fancy-log');

const GULP_CONFIG = require('../gulpConfig');

/**
 * Performs lint on the default src directory
 * @param {function} done - callback on complete
 * @see lintPatterns()
 */
const lint = (done) => {
  const patterns = GULP_CONFIG.patterns.src;
  lintPatterns(patterns, done);
};

/**
 * Performs lint on a set of paths.
 * @param {string[]} patterns - collection of paths to lint
 * @param {function} done - callback on complete
 */
const lintPatterns = (patterns, done) => {
  log(`starting:lint ${patterns}`);
  const scriptStream = gulp.src(patterns)  
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

//-- WATCH

/**
 * Watches the default src patterns and runs lints on them.
 * @return {gulp.ScriptStream}
 */
const lintWatcher = () => {
  const patterns = GULP_CONFIG.patterns.src;
  return lintPatternWatcher(patterns);
};

/**
 * Watches a specific set of patterns and runs lints when those files change.
 * @param {string[]} patterns 
 * @returns {Gulp.ScriptStream}
 */
const lintPatternWatcher = (patterns) => {
  const runner = lintWatchRunner.bind(this, patterns);
  const scriptStream = gulp.watch(patterns, runner);

  return scriptStream;
};

/**
 * Runner when lint should be executed
 * @param {string[]} patterns - patterns to be linted
 * @param {function} done - callback on complete
 */
const lintWatchRunner = (patterns, done) => {
  log('file changed');
  lintPatterns(patterns, done);
};

gulp.task('lint:watch', lintWatcher);

module.exports = {
  lint,
  lintPatterns,
  lintWatcher,
  lintPatternWatcher,
  lintWatchRunner
};