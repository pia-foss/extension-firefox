require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const rimraf = require('rimraf');

// variables
const firefox = 'firefox';
const platform = process.platform;
const buildsDir = root('builds');
const executablesDir = root('node_modules', '.bin');
const webstoreDir = path.join(buildsDir, 'webstore');
const artifactsDir = path.join(buildsDir, 'webstore', 'web-ext-artifacts');
const VERSION = fs.readFileSync(path.join(__dirname, '..', 'VERSION')).toString().trim();

const NamingScheme = {
  internal(browser) { return `private_internet_access-${browser}-v${VERSION}`; },
  beta(browser) { return `private_internet_access-${browser}-v${VERSION}-beta`; },
  public(browser) { return `private_internet_access-${browser}-v${VERSION}-release`; },
};

function print(msg) {
  console.log(msg); // eslint-disable-line no-console
}

function setEnv(key, value) {
  process.env[key] = value;
  print(`${key}=${value}`);
}

function root(...filesOrDirs) {
  return path.resolve(__dirname, '..', ...filesOrDirs);
}

function remove(target) {
  return new Promise((resolve, reject) => {
    print(`removing files and/or directories at ${target}`);
    rimraf(target, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function execWithOutput(command, rejectOnErr = false) {
  return new Promise((resolve, reject) => {
    print(`running command: ${command}`);
    const proc = exec(command);

    // Pipe output
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);

    // Resolve when completed
    proc.on('exit', () => {
      resolve();
    });

    // Reject shortly after error (to allow error messages to be written to stderr)
    let errTimeout = !rejectOnErr;
    proc.stderr.on('data', (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      if (!errTimeout) {
        errTimeout = setTimeout(() => {
          reject(new Error('Process terminated due to error'));
        }, 300);
      }
    });
  });
}

// generate the command to pack the extension
function generatePackCommand(browser) {
  // general pack flags
  const apiKey = process.env.FIREFOX_KEY; // eslint-disable-line no-process-env
  const apiSecret = process.env.FIREFOX_SECRET; // eslint-disable-line no-process-env

  // os dependant browser location
  const key = `--api-key ${apiKey}`;
  const secret = `--api-secret ${apiSecret}`;
  const source = `--source-dir ${webstoreDir}`;
  const artifacts = `--artifacts-dir ${artifactsDir}`;

  const command = `web-ext sign ${source} ${artifacts} ${key} ${secret}`;

  return command;
}

function generateWebstoreFilePath(browser) {
  const filePath = artifactsDir;
  const fileName = `private_internet_access-${VERSION}-an+fx.xpi`;
  return path.join(filePath, fileName);
}

function generateFilePath(browser, directory) {
  const audience = process.env.audience || 'internal';
  let filename = NamingScheme[audience](browser);
  filename += '.xpi';
  return path.join(directory, filename);
}

function compileCode(browser, release = false) {
  // generate a build and pack the extension
  return new Promise((resolve, reject) => {
    print(`--- Building for ${browser}`);
    process.env.browser = browser; // eslint-disable-line no-process-env

    print('compiling code...');
    const grunt = exec('grunt');
    grunt.stdout.pipe(process.stdout);
    grunt.stderr.on('data', (err) => { return reject(err); });
    grunt.on('exit', () => { return resolve(); });
  });
}

// package using Firefox browser
function packExtension(browser) {
  print('packing through browser...');
  return new Promise((resolve, reject) => {
    const command = generatePackCommand(browser);
    print(`\n\n -- running command --\n${command}\n\n`);
    const pack = exec(command);
    pack.stdout.pipe(process.stdout);
    pack.stderr.on('data', (err) => { return reject(err); });
    pack.on('exit', () => { return resolve(); });
  });
}

function renameExtension(browser, directory) {
  return fs.moveSync(generateWebstoreFilePath(browser), generateFilePath(browser, directory));
}

function logInfo() {
  // User Output
  print(`Launching from directory: ${__dirname}`);
  print(`Building extension version: ${VERSION}`);
  print(`Detected Platform: ${platform}`);
}

/**
 * Pack extension and move to appropriate directory
 *
 * @param {string} browser The browser name to build for
 * @param {string} [destDir] the destination directory for packed extension.
 * defaults to `builds` directory
 */
function generateExtension(browser, destDir = buildsDir) {
  logInfo();

  // generate a build and pack the extension
  return compileCode(browser)
    .then(() => { return packExtension(browser); })
    .then(() => { return renameExtension(browser, destDir); })
    .then(() => { print(`${browser} done`); });
}

function runMochaTests() {
  const mochaPath = path.join(executablesDir, 'mocha');
  const command = `${mochaPath} test/e2e/**/*.spec.ts --opts test/e2e/mocha.opts`;
  return execWithOutput(command);
}

module.exports = {
  print,
  setEnv,
  firefox,
  compileCode,
  generateExtension,
  runMochaTests,
  root,
  remove,
};
