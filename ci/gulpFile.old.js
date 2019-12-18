const gulp = require('gulp');
/** logger */
const log = require('fancy-log');
/** Handle errors to avoid watch from breaking */
const plumber = require('gulp-plumber');
/** Support linting */
const eslint = require('gulp-eslint');
/** Compressor (not used for server) */
const webpack = require('webpack');
/** handles paths to files */
const path = require('path');
/** handles any file access info */
const fs = require('fs-extra');
/** Provides JS to refresh the browser on changes (used only for dev) */
const LiveReload = require('livereload');
/** nodemon server - used for watch and telling livereload to fire */
const Nodemon = require('nodemon');
/** jest testing */
const jestCLI = _interopRequireDefault(require('jest-cli')).default;

/**
 * Force a module even if using commonjs
 * @param {object} obj - either a commonjs or an es6 module
 * @return {object} - a forced es6 module
 */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//-- for those cases that absolutely need it
/** allow command line arguments - like stubbing out pages */
const argv = require('yargs').argv;

/** dead simple template engine
 *  @TODO: review whether yeoman would be actually wanted
 */
const TemplateEngine = require('./src/local_modules/TemplateEngine');

//-- project configuration
const config = require('config');
//-- path configuration
const filePaths = require('./config/FilePaths');

//-- the server port is something special - get it so we can tell the user where to go
const SERVER_PORT = process.env.PORT || config.DEFAULT.PORT;

/** Configurator to generate Webpack configurations */
const WebpackConfigurator = require('./WebpackConfigurator');
/** configuration for live reload
 *  <p>see here for the livereload config settings and startup</p>
 *  <p>https://www.npmjs.com/package/livereload</p>
 **/
/** configurator for Jest */
const JestConfig = require('./jest.config');
/** config for live reload */
const LiveReloadConfig = require('./liveReload.config');
/** nodemon config */
const NodemonConfig = require('./nodemonConfig');

let webpackServer;
let liveReloadServer;
let nodemonServer;
let nodemonRefreshTimeout;

//-- deprecated plugins no longer needed
// const sass = require('gulp-sass');
// const webpackStream = require('webpack-stream');

/*
gulp.task('test-webpack', (done) => {
  log('checking the webpack config');
  const webpackConfig = WebpackConfigurator.configureWebpack();
  log(JSON.stringify(webpackConfig, null, 2));
  done();
});
*/

//-- useful for verifying a command running
//-- support async completion
//-- https://stackoverflow.com/questions/36897877/gulp-error-the-following-tasks-did-not-complete-did-you-forget-to-signal-async
/*
gulp.task('say-hello', (done) => {
  log('hello');
  done();
});
*/


// #    #    #    #    #    #    #    #    #    #    #    #
// -- start of scripts
// #    #    #    #    #    #    #    #    #    #    #    #


/**
 * List the paths for where all the files are
 */
gulp.task('view-file-paths', (done) => {
  log(JSON.stringify(filePaths, null, 2));
  done();
});

/**
 * View the webpack configuration
 */
gulp.task('view-webpack-config', (done) => {
  const webpackConfig = WebpackConfigurator.configureWebpack();
  log(JSON.stringify(webpackConfig, null, 2));
  done();
});

/**
 * View the livereload configuration
 */
gulp.task('view-livereload-config', (done) => {
  log(JSON.stringify(LiveReloadConfig, null, 2));
  done();
});

/**
 * View the nodemon configuration
 */
gulp.task('view-nodemon-config', (done) => {
  log(JSON.stringify(NodemonConfig, null, 2));
  done();
});

/**
 * View the current jest configuration
 */
gulp.task('view-jest-config', (done) => {
  log(JSON.stringify(JestConfig, null, 2));
  done();
});

/**
 * View the styleguide (styleguidist) configuration
 */
gulp.task('view-styleguide-config', (done) => {
  log(JSON.stringify(require(filePaths.styleGuideConfig), null, 2));
  done();
});

/**
 * Compile the application using webpack.
 * <p>Transpile, lint, etc</p>
 */
gulp.task('webpack', (done) => {
  log('Executing webpack');

  const webpackConfig = WebpackConfigurator.configureWebpack();
  // log(JSON.stringify(webpackConfig));

  webpack(webpackConfig, (err, stats) => {
    if (err) {
      log.error('Webpack', err);
      done();
    } else {
      log(stats.toString());
      done();
    }
  });
});

/**
 * Lint, Compile and watch the application.
 * <p>If there are changes (either server side or site side)
 *  then reload</p>
 */
gulp.task('watch', (done) => {
  log('run webpack with watch');

  const webpackConfig = WebpackConfigurator.configureWebpack({
    watch: true,
  });
  log(JSON.stringify(webpackConfig));

  //-- compiles and builds the files that we'll serve
  const webpackPromise = new Promise((resolve, reject) => {
    webpackServer = webpack(webpackConfig, (err, stats) => {
      if (err) {
        log.error('Webpack', err);
        reject('Error loading webpack...');
      } else {
        log('Webpack completed compiling...');
        log(stats.toString());

        resolve('Everything loaded');
      }
    });
  });
  
  //-- livereload provides seamless connection to allow refreshing the browser
  const liveReloadPromise = new Promise((resolve, reject) => {
    liveReloadServer = LiveReload.createServer({},
      () => {
        log('liveReloadServer ready');
        // log(arguments);
        resolve('live reload server loaded');
      }
    );
    liveReloadServer.watch(filePaths.serverPublicAllFilesPath);
  });

  //-- nodemon is required to run the server code (src/serverSrc/index.js)
  //-- and to restart when it changes
  const nodemonPromise = new Promise((resolve, reject) => {
    nodemonServer = Nodemon(NodemonConfig);
    nodemonServer.on('start', () => {
      log('nodemon started');

      //-- for some reason the restart is calling the start to get called again.
      //-- so we listen for start
      if (nodemonRefreshTimeout) {
        clearTimeout(nodemonRefreshTimeout);
      }
      
      nodemonRefreshTimeout = setTimeout(()=>{
        liveReloadServer.refresh("");
      }, 1000);

      resolve('nodemon has started');
    }).on('quit', () => {
      log('nodemon has quit');
    }).on('restart', (files) => {
      log('nodemon restart');
    });
  })

  Promise.all([webpackPromise, liveReloadPromise, nodemonPromise])
    .then((message) => {
      log('Everything has loaded:');
      log(' * linting files in src/siteSrc');
      log(' * linting express files in src/serverSrc');
      log(' * running liveReload for changes in either');
      log('To see the webpack config - run `npm run view-webpack-config`');
      log('To see the liveReload config - run `npm run view-livereload-config');
      log('To view the nodemon config - run `npm run view-nodemon-config');
      log(`You can now browse to your site on http://localhost:${SERVER_PORT}/`);
      done();
    })
    .catch((message) => {
      log('Error occurred when loading liveserver and webpack.');
      log(message);
      log('\n\n\nYou will likely need to Exit (Ctrl-C) and restart.');
      done();
    })
});

/**
 * Lint all the 
 */
gulp.task(
  'lint-internal',
  () => {
    const lintPaths = [filePaths.internalJS, filePaths.localModulesJS];
    log('Now linting:', lintPaths);

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
  }
);

gulp.task(
  'internal-watch',
  () => {
    const watchPaths = [filePaths.internalJS, filePaths.localModulesJS];
    log('Now watching:', watchPaths);

    const scriptStream = gulp.watch(
      watchPaths,
      gulp.series(['lint-internal'])
    );

    return scriptStream;
  }
);


gulp.task(
  'lint-server',
  () => {
    const lintPaths = [
      filePaths.serverJS,
      '!' + filePaths.serverPublicAllFiles,
      filePaths.localModulesJS
    ];
    log('Now linting:', lintPaths);

    const scriptStream = gulp.src(lintPaths)
      .pipe(plumber({
        errorHandler: (error) => {
          log.error(error.message);
          scriptStream.emit('end');
        },
      }))
      .pipe(eslint({
        configFile: filePaths.eslintConfig,
      }))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());

    return scriptStream;
  }
);

gulp.task(
  'watch-server',
  () => {
    const watchPaths = [
      filePaths.serverJS,
      '!' + filePaths.serverPublicAllFiles,
      filePaths.localModulesJS
    ];
    log('Now watching:', watchPaths);

    const scriptStream = gulp.watch(
      watchPaths,
      gulp.series(['lint-server'])
    );

    return scriptStream;
  }
);

//-- for now, linting tests uses the same as watching the server
gulp.task('lint-test', gulp.series('lint-server'));

gulp.task('test-execute', (done) => {
  //-- set the node env to test
  process.env.NODE_ENV = 'test';
  
  //-- set the root directory
  JestConfig.rootDir = process.cwd();

  if (argv.onlyChanged) {
    console.log('only running tests against changed tests');
    JestConfig.onlyChanged = true;
  }
  
  jestCLI.runCLI(JestConfig, [JestConfig.rootDir]).then(function (_ref) {
    var results = _ref.results;

    if (results.numFailedTests || results.numFailedTestSuites) {
      //-- @TODO: determine how to stop gracefully
      // done(new Error('Halting due to failed tests.'));
      log.error('Errors occurred. Halting');
      done();
    } else {
      log('no tests failed');
      done();
    }
  });
});

//-- test runs linting and then test execution
gulp.task('test', gulp.series('lint-test', 'test-execute'));

gulp.task('test-watch', () => {
  const watchPaths = [
    ...filePaths.testPatterns,
    filePaths.serverJS,
    '!' + filePaths.serverPublicAllFiles,
    filePaths.localModulesJS
  ];
  log('Now watching:', watchPaths);

  const scriptStream = gulp.watch(
    watchPaths,
    gulp.series(['test'])
  );

  return scriptStream;
});

gulp.task('create-page', (done) => {
  //-- check if the page name was sent
  if (!argv.pageName) {
    log.error('cannot execute task create-page');
    log.error('--pageName [[camel case name of page]] : is required');
    done();
    return;
  }

  const pageName = argv.pageName;

  const pagePaths = TemplateEngine.createPage(pageName);

  //-- do not automatically add the route yet
  const routerPath = filePaths.serverStartIndex;

  log(`
completed writing ejs file:${pagePaths.ejs}
completed writing app file:${pagePaths.app}

Note you will need to add a route to make this page acessible.
${routerPath}`)

  done();
});

//-- chains
//-- https://fettblog.eu/gulp-4-parallel-and-series/

//-- include series once we have a good set of linters.
gulp.task('lint-site', gulp.series('webpack'));
gulp.task('lint', gulp.series('lint-site','lint-server'));
gulp.task('compile', gulp.series('webpack'));
gulp.task('default', gulp.series('webpack'));
