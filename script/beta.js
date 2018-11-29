const {
  generateExtension,
  firefox,
  print,
  setEnv,
} = require('./util');

setEnv('build', 'webstore');
setEnv('gitinfo', 'no');
setEnv('audience', 'beta');

// --- Opera ---
generateExtension(firefox)
  .catch((err) => { print(err); });
