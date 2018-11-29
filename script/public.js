const {
  generateExtension,
  firefox,
  print,
  setEnv,
} = require('./util');

setEnv('build', 'webstore');
setEnv('gitinfo', 'no');
setEnv('audience', 'public');

// --- Opera ---
generateExtension(firefox)
  .catch((err) => { print(err); });
