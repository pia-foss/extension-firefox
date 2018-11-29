const {
  compileCode,
  firefox,
  setEnv,
  print,
} = require('./util');

// set up env vars
setEnv('build', 'debug');
setEnv('audience', 'internal');
setEnv('gitinfo', 'yes');

// --- Opera ---
compileCode(firefox)
  .catch((err) => { print(err); });
