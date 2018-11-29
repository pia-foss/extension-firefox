/* eslint-disable global-require */
module.exports = {
  pkg: require('../package.json'),
  babel: require('./babel.json'),
  browserify: require('./browserify.json'),
  sass: require('./sass.json'),
  eslint: require('./eslint.json'),
  oneskyExport: require('./oneskyexport'),
  oneskyImport: require('./oneskyimport'),
  env: require('./env.json'),
  config: require('./buildconfig.json'),
  replace: require('./replacements.json'),
  purifycss: require('./purifycss.json'),
  compress: require('./compress.json'),
};
