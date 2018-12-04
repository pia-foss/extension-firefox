const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { print } = require('./util');

// Get Version
const versionFilePath = path.join(__dirname, '..', 'VERSION');
const versionFile = fs.readFileSync(versionFilePath, 'utf8');
const VERSION = versionFile.trim();

// Filepaths and Filenames
const filename = `private_internet_access-firefox-v${VERSION}-beta`;
const xpiFile = `${filename}.xpi`;
const infoFile = 'info.md';
const masterZip = path.join(__dirname, '..', 'builds', `${filename}-release.zip`);

Promise.resolve()
  // create beta release zip file
  .then(() => {
    const buildsDir = path.join(__dirname, '..', 'builds');
    return execSync(`zip -r ${masterZip} ${xpiFile} ${infoFile}`, { cwd: buildsDir });
  })
  // clean up necessary files
  .then(() => {
    const buildsDir = path.join(__dirname, '..', 'builds');
    const crx = path.join(buildsDir, xpiFile);
    const info = path.join(buildsDir, infoFile);
    fs.unlinkSync(crx);
    fs.unlinkSync(info);
  })
  // --- Errors ---
  .catch((err) => { print(err.toString()); });
