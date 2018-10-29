const path = require('path');
const { exit } = require('process');
const { config } = require('dotenv');

const { runMochaTests, print, root, firefox, remove, generateExtension } = require('./util');

(async () => {
  try {
    // setup env
    config();
    process.env.build = 'webstore';
    process.env.gitinfo = 'yes';
    process.env.freezeApp = 0;

    print(`BUILD=${process.env.build}`);
    print(`GITINFO=${process.env.gitinfo}`);
    print(`FREEZE_APP=${process.env.freezeApp}`);

    const directory = root('test', 'e2e');
    const extensionGlob = path.join(directory, '*.xpi');

    await remove(extensionGlob);
    print('\n\n-- building extension --\n\n');
    await generateExtension(firefox, directory);
    print('\n\n-- running basic tests --\n\n');
    await runMochaTests();
    if (!process.env.PIA_SKIP_CLEANUP) {
      print('\n\n-- cleaning up --\n\n');
      await remove(extensionGlob);
    }
    print('\n\n-- completed --\n\n');
  }
  catch (err) {
    print(err);
  }
})();
