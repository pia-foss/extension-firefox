// third party requirements
require('dotenv').config();
const fs = require('fs-extra');
const color = require('colors');
const echomd = require('echomd');
const config = require('./config');


// variables
let gitinfo = process.env.gitinfo; // eslint-disable-line no-process-env
const {build, freezeApp, audience, browser} = process.env; // eslint-disable-line no-process-env

// helper functions
const stringify = (s) => {
  return (typeof s === 'string') ? s : JSON.stringify(s);
};

const info = (s) => {
  return echomd(`${color.yellow('INFO')}: ${stringify(s)}`);
};

const panic = (s) => {
  echomd(`${color.red('PANIC')}: ${stringify(s)}`);
  process.exit(1); // eslint-disable-line no-process-exit
};


module.exports = function gruntFile(grunt) {
  const browserName = browser;
  const pkgVersion = grunt.file.read('./VERSION').trim();
  const getZipPath = () => { return `./zips/private_internet_access-${browserName}-v${pkgVersion}.zip`; };

  grunt.initConfig(config);
  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-config');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-onesky-export');
  grunt.loadNpmTasks('grunt-onesky-import');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-purifycss');

  grunt.registerTask('build', 'Builds the extension.', () => {
    if (browserName !== 'firefox') {
      return panic('The $browser variable was not set, set $browser and rerun this task.');
    }

    let tasks = [];
    switch(build) {
      case 'debug':
        tasks = ['env:debug', 'config:debug', 'gitinfo', 'deletebuild', 'createbuild', 'babel', 'replace', 'sass', 'browserify', 'copyfiles', 'changelog', 'removeartifacts'];
        break;
      case 'webstore':
        tasks = ['env:webstore', 'config:webstore', 'gitinfo', 'deletebuild', 'createbuild', 'babel', 'replace', 'sass', 'browserify', 'copyfiles',
                     'purifycss', 'changelog', 'removeartifacts'];
        break;
      default:
        panic('The build name was not set, set $build and then rerun this task.');
        break;
    }
    grunt.task.run(tasks);
  });

  grunt.registerTask('default', 'build');

  grunt.registerTask('release', ['setreleaseenv', 'build', 'createzip', 'compress']);

  grunt.freezeApp = () => { return freezeApp !== '0'; };

  grunt.getCommit = () => {
    if(['yes', '1', 'true'].includes(gitinfo)) {
      return grunt.config.get('gitinfo').local.branch.current.SHA;
    }
  };

  grunt.getBranch = () => {
    if(['yes', '1', 'true'].includes(gitinfo)) {
      return grunt.config.get('gitinfo').local.branch.current.name;
    }
  };

  grunt.zipName = () => { return getZipPath(build); };

  grunt.registerTask('setreleaseenv', 'set release env vars', () => {
    const empty = (s) => !s || (s.trim && s.trim().length === 0);
    if(audience === 'internal' && empty(gitinfo)) { gitinfo = 'yes'; }
  });

  grunt.registerTask('changelog', 'Convert CHANGELOG.md from markdown to HTML', () => {
    const marked    = require('marked');
    const changelog = grunt.file.read('./CHANGELOG.md');
    marked.setOptions({sanitize: false, smartypants: true, gfm: true});
    grunt.file.write(`${grunt.config.get('buildpath')}/html/CHANGELOG.html`, marked(changelog));
  });

  grunt.registerTask('createzip', 'Builds the extension, and then creates a .zip file from the build directory.', () => {
    if (!build) {
      return panic('The build name was not set, set $build and then rerun this task.');
    }

    if (!browserName) {
      return panic('The $browser variable was not set, set $browser and then rerun this task.');
    }

    info('Building extension');
    fs.mkdirpSync('zips');
    info('Building zip archive');
  });

  grunt.registerTask('deletebuild', 'Delete a build directory.', () => {
    return fs.removeSync(grunt.config.get('buildpath'));
  });

  grunt.registerTask('createbuild', 'Create a build directory.', () => {
    return fs.mkdirpSync(grunt.config.get('buildpath'));
  });

  grunt.registerTask('copyfiles', 'Copy static assets to a build directory.', () => {
    const buildPath = grunt.config.get('buildpath');

    switch(browserName) {
      case 'opera':
        fs.copySync(buildPath + '/manifest.opera.json', buildPath + '/manifest.json');
        break;
      default:
        fs.removeSync(buildPath + '/manifest.opera.json');
        break;
    }

    fs.copySync('src/_locales', buildPath + '/_locales');
    fs.copySync('src/css', buildPath + '/css');
    fs.copySync('src/fonts', buildPath + '/fonts');
    fs.copySync('src/html', buildPath + '/html');
    fs.copySync('src/images', buildPath + '/images');
    fs.copySync('src/js/pac.js', buildPath + '/js/pac.js');
  });

  grunt.registerTask('removeartifacts', 'Remove artifacts created during the build process.', () => {
    fs.removeSync('src/js/templates');
    fs.removeSync('src/js/component');
    fs.removeSync('src/js/hoc');
    fs.removeSync('tmp/');
  });
};
