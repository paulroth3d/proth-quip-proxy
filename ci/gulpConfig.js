const path = require('path');

/**
 * configuration for gulp
 */
const config = {
  default: {
    say: 'Say ',
    msg: 'Hello!'
  },
  paths: {
    ci: '../ci',
    public: '../public',
    views: '../views',
    eslintConfigPath: '../.eslintrc.js'
  },
  filePaths: {},
  patterns: {
    src: ['../public/**/*.js', '../index.js', '!../node_modules'],
    internal: ['./gulpFile.js', './tasks/**/*.js'],
    test: ['../*.test.js', '../public/**/*.test.js']
  },
  get msg(){ return `Say:${this.default.msg}`; }
};

config.filePaths.ci = path.resolve(config.paths.ci);
config.filePaths.public = path.resolve(config.paths.public);
config.filePaths.views = path.resolve(config.paths.views);
config.filePaths.eslintConfigPath = path.resolve(config.paths.eslintConfigPath);

module.exports = config;
