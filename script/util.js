require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const {execSync, exec} = require('child_process');


// variables
const firefox = 'firefox';
const platform = process.platform;
const webstoreDir = path.join(__dirname, '..', 'builds', 'webstore');
const artifactsDir = path.join(__dirname, '..', 'builds', 'webstore', 'web-ext-artifacts');
const VERSION = fs.readFileSync(path.join(__dirname, '..', 'VERSION')).toString().trim();


// generate the command to pack the extension
const generatePackCommand = function (browser) {
  // general pack flags
  const apiKey = process.env.FIREFOX_KEY; // eslint-disable-line no-process-env
  const apiSecret = process.env.FIREFOX_SECRET; // eslint-disable-line no-process-env

  // os dependant browser location
  const key = `--api-key ${apiKey}`;
  const secret = `--api-secret ${apiSecret}`;
  const source = `--source-dir ${webstoreDir}`;
  const artifacts = `--artifacts-dir ${artifactsDir}`;
  return `web-ext sign ${source} ${artifacts} ${key} ${secret}`;
};

const generateWebstoreFilePath = function(browser) {
  const filePath = path.join(__dirname, '..', 'builds', 'webstore', 'web-ext-artifacts');
  const fileName = `private_internet_access-${VERSION}-an+fx.xpi`;
  return path.join(filePath, fileName);
};

const generateFilePath = function (browser) {
  return path.join(__dirname, '..', 'builds', `private_internet_access-${browser}-v${VERSION}.xpi`);
};

const compileCode = function (browser, release = false) {
  // generate a build and pack the extension
  return new Promise((resolve, reject) => {
    console.log(`--- Building for ${browser}`);
    process.env.browser = browser; // eslint-disable-line no-process-env

    console.log('compiling code...');
    const grunt = exec('grunt');
    grunt.stdout.pipe(process.stdout);
    grunt.stderr.on('data', (err) => { return reject(err); });
    grunt.on('exit', () => { return resolve(); });
  });
};

// package using Firefox browser
const packExtension = function (browser) {
  console.log('packing through browser...');
  return new Promise((resolve, reject) => {
    const pack = exec(generatePackCommand(browser));
    pack.stdout.pipe(process.stdout);
    pack.stderr.on('data', (err) => { return reject(err); });
    pack.on('exit', () => { return resolve(); });
  });
};

const renameExtension = function (browser) {
   return fs.moveSync(generateWebstoreFilePath(browser), generateFilePath(browser));
};

const generateExtension = function (browser) {
  // User Output
  console.log(`Launching from directory: ${__dirname}`);
  console.log(`Building extension version: ${VERSION}`);
  console.log(`Detected Platform: ${platform}`);

  // generate a build and pack the extension
  return compileCode(browser)
  .then(() => { return packExtension(browser); })
  .then(() => { return renameExtension(browser); })
  .then(() => { console.log(`${browser} done`); });
};


module.exports = {
  firefox: firefox,
  compileCode: compileCode,
  generateExtension: generateExtension
};
