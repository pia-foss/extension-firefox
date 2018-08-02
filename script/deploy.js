const {generateExtension, firefox} = require('./util');

// set up env vars
process.env.build = 'webstore'; // eslint-disable-line no-process-env

console.log(`BUILD=${process.env.build}`); // eslint-disable-line no-process-env

// --- Opera ---
generateExtension(firefox)
.catch((err) => { console.log(err); });
