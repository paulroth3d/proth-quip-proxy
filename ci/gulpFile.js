const gulp = require('gulp');
/** logger */
// const log = require('fancy-log');
/** handle errors to avoid breaking */
// const plumber = require('gulp-plumber');
/** support-linting */
// const eslint = require('gulp-eslint');
/** support tests */
// const mocha = require('gulp-mocha');

const tasks = require('./tasks');

const GULP_CONFIG = require('./gulpConfig');

gulp.task('lint:src',
  tasks.lint.lintPatterns.bind(this, GULP_CONFIG.patterns.src)
);
gulp.task('lint:internal',
  tasks.lint.lintPatterns.bind(this, GULP_CONFIG.patterns.internal)
);
gulp.task('lint:test',
  tasks.lint.lintPatterns.bind(this, GULP_CONFIG.patterns.test)
);

gulp.task('lint:watch:src',
  tasks.lint.lintPatternWatcher.bind(this, GULP_CONFIG.patterns.src)
);
gulp.task('lint:watch:internal',
  tasks.lint.lintPatternWatcher.bind(this, GULP_CONFIG.patterns.internal)
);

gulp.task('default', gulp.series('say-hello'));