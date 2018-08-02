const {generateExtension, firefox} = require('./util');

// set up env vars
process.env.build = 'webstore'; // eslint-disable-line no-process-env
process.env.gitinfo = 'yes'; // eslint-disable-line no-process-env

console.log(`BUILD=${process.env.build}`); // eslint-disable-line no-process-env
console.log(`GITINFO=${process.env.gitinfo}`); // eslint-disable-line no-process-env

// --- Firefox ---
generateExtension(firefox)
.catch((err) => { console.log(err); });
