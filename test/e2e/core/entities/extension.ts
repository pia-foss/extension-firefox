import * as fs from 'fs';

import { root } from '../util/root';
/*
 * Get application version
 */
function getVersion(): Promise<string> {
  return new Promise((resolve) => {
    const versionFile = root('VERSION');
    fs.readFile(versionFile, (err, data) => {
      const version = data.toString().trim();
      resolve(version);
    });
  });
}

function getExtensionName(version: string) {
  return `private_internet_access-firefox-v${version}.xpi`;
}

async function getExtensionPath() {
  const version = await getVersion();
  const extensionName = getExtensionName(version);

  return root('test', 'e2e', extensionName);
}

export { getExtensionPath };
