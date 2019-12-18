const path = require('path');

/**
 * configuration for gulp
 */
const config = {
  default: {
    say: 'Say ',
    msg: 'Hello!'
  },
  dir: {
    ci: './ci',
    public: './public',
    views: './views'
  },
  paths: {},
  get msg(){ return `Say:${this.default.msg}`; }
};

config.paths.ci = path.resolve(config.dir.ci);
config.paths.public = path.resolve(config.dir.public);
config.paths.views = path.resolve(config.dir.views);

module.exports = config;
