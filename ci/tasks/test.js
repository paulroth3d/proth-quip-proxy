const gulp = require('gulp');
const mocha = require('gulp-mocha'); // eslint-disable-line no-unused-vars
const log = require('fancy-log'); // eslint-disable-line no-unused-vars

const GULP_CONFIG = require('../gulpConfig');

const test = (done) => {
  return testPattern(GULP_CONFIG.patterns.test, done);
};

const testPattern = (patterns, done) => {
  console.log('testing');
  const scriptStream = gulp.src(patterns)
    .pipe(mocha())
    .on('end', done)
    .once('error', err => {
      console.error(err);
      done();
    });
  return scriptStream;
};

gulp.task('test', test);

const testWatch = () => {
  const pattern = GULP_CONFIG.patterns.test;
  return testPatternWatch(pattern);
};

const testPatternWatch = (patterns) => {
  const runner = testWatchRunner.bind(this, patterns);
  const scriptStream = gulp.watch(patterns, runner);
  return scriptStream;
};

const testWatchRunner = (pattern, done) => {
  console.log('test changed');
  return testPattern(pattern, done);
};

gulp.task('test:watch', testWatch);

module.exports = {
  test,
  testPattern,
  testWatch,
  testPatternWatch,
  testWatchRunner
};