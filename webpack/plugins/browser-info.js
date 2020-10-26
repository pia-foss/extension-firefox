const { join } = require('path');
const crypto = require('crypto');
const fs = require('fs');
const {
  dist,
  root,
  print,
  Color,
  getVersion,
  getGitHash,
  formatFilename,
} = require('../util');

class BrowserInfoPlugin {
  constructor(opts = {}) {
    this.version = opts.version || getVersion();
    if (!process.env.RELEASE_DATE) { throw new Error('must set RELEASE_DATE environment variable'); }
    this.date = opts.releaseDate;
    this.getCommitHash = opts.getCommitHash || getGitHash;
    this.dest = opts.dest || dist('..');
    this.filename = opts.filename || formatFilename('info-[browser].json');
    this.changelogPath = opts.changelogPath || root('CHANGELOG.md');
    this.changelogStart = process.env.CHANGELOG_START;
    this.changelogEnd = process.env.CHANGELOG_END;
    if (!this.changelogEnd || !this.changelogStart) {
      throw new Error('must set CHANGELOG_START and CHANGELOG_END environment variables');
    }
  }

  getInfoPromise() {
    if (!this.infoPromise) {
      this.infoPromise = Promise.all([
        // pack promise
        new Promise((resolve) => {
          this.resolvePacked = resolve;
        }),
      ]).then(async ([{ packedFilename, packedDir }]) => {
        await this.writeInfoFile({ packedDir, packedFilename });
      });
    }
    return this.infoPromise;
  }

  getChanges() {
    const changelog = [];
    const clFile = fs.readFileSync(this.changelogPath, 'utf8').trim();

    let content = clFile.split(this.changelogStart)[1];
    content = content.split(this.changelogEnd)[0].trim();
    content = content.split('*');

    content.forEach((line) => {
      if (line) { changelog.push(line.trim()); }
    });

    return changelog;
  }

  async writeInfoFile({ packedDir, packedFilename }) {
    try {
      const downloadUrl = 'https://installers.privateinternetaccess.com/download';
      const packedPath = join(packedDir, packedFilename);
      const packedHash = await BrowserInfoPlugin.hash(packedPath);
      const info = {
        version: this.version,
        available: true,
        daet: this.date,
        commit: await Promise.resolve(this.getCommitHash()),
        changes: [...this.getChanges()],
        installers: [
          {
            platform: '',
            platform_title: 'Windows / Mac / Linux / Other',
            url: `${downloadUrl}/${packedFilename}`,
            sha: packedHash,
          },
        ],
      };
      const file = JSON.stringify(info, null, 2);
      fs.writeFileSync(join(this.dest, this.filename), file);
      print(`BrowserInfoPlugin: successfully wrote info to ${this.filename}`);
    }
    catch (err) {
      print('BrowserInfoPlugin: failed with error', Color.red);
      print(err.message || err, Color.red);
      process.exit(1);
    }
  }

  apply(compiler) {
    compiler.hooks.packed.tapPromise('BrowserInfoPlugin', async (packedDir, packedFilename) => {
      const infoPromise = this.getInfoPromise();
      this.resolvePacked({ packedDir, packedFilename });
      await infoPromise;
    });
  }

  static async hash(filepath) {
    const shasum = crypto.createHash('sha256');
    return new Promise((resolve) => {
      const input = fs.createReadStream(filepath);
      input.on('readable', () => {
        const data = input.read();
        if (data) {
          shasum.update(data);
        }
        else {
          resolve(shasum.digest('hex'));
        }
      });
    });
  }
}

module.exports = BrowserInfoPlugin;
