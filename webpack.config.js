/* eslint indent: 0 */
const dotenv = require('dotenv');
const ExtractCssPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');
const Config = require('webpack-chain');

dotenv.config();

const {
  PackPlugin,
  MovePlugin,
  GitInfoPlugin,
  ReporterPlugin,
  ChangelogPlugin,
  BrowserInfoPlugin,
  ExtensionManifestPlugin,
} = require('./webpack/plugins');
const {
  env,
  src,
  root,
  dist,
  Build,
  print,
  getBuild,
  getBrowser,
  getAliases,
  getVersion,
  getExtensions,
} = require('./webpack/util');
const Environment = require('./webpack/environment');

const config = new Config();
const environments = new Environment();

// ----------------- Common Config ----------------- //

config
  .target('web')
  // Main entry points
  .entry('foreground')
    .add(src('jsx', 'app', 'index.jsx'))
    .end()
  .entry('background')
    .add(src('js', 'background.js'))
    .end()
  // Popups
  .entry('importrules')
    .add(src('js', 'popups', 'importrules.js'))
    .end()
  // Error Pages
  .entry('connfail')
    .add(src('js', 'errorpages', 'connfail.js'))
    .end()
  .entry('authfail')
    .add(src('js', 'errorpages', 'authfail.js'))
    .end()
  // Workers
  .entry('https-upgrade-worker')
    .add(src('js', 'util', 'https-upgrade', 'worker.js'))
    .end()
  // PAC File
  .entry('pac')
    .add(src('js', 'pac.js'))
    .end()
  .output
    .path(dist())
    .filename('[name].js')
    .publicPath('/')
    .end()
  .performance
    .hints(false)
    .end()
    .stats({
      all: false,
      errors: true,
      errorDetails: true,
      timings: true,
      warnings: true,
    })
  .resolve
    .extensions
      .merge(getExtensions())
      .end()
    .end()
  .module
    .rule('javascript')
      .test(/\.m?jsx?$/)
      .exclude
        .add(/node_modules/)
        .end()
      .use('babel')
        .loader('babel-loader')
        .end()
      .end()
    .rule('scss')
      .test(/\.scss$/)
      .use('extract css loader')
        .loader(ExtractCssPlugin.loader)
        .end()
      .use('css loader')
        .loader('css-loader')
        .end()
      .use('postcss loader')
        .loader('postcss-loader')
        .end()
      .use('sass loader')
        .loader('sass-loader')
        .end()
      .end()
    .rule('css')
      .test(/\.css$/)
      .use('css loader')
        .loader('css-loader')
        .end()
      .use('postcss loader')
        .loader('postcss-loader')
        .end()
      .use('sass loader')
        .loader('sass-loader')
        .end()
      .end()
    .rule('images')
      .test(/\.(png|jpg|gif|svg)$/)
      .use('file loader')
        .loader('file-loader')
        .options({
          name: '[name].[ext]',
          outputPath: 'files',
        })
        .end()
      .end()
    .end()
  .plugin('reporter')
    .use(ReporterPlugin, [])
    .end()
  .plugin('clean')
    .use(CleanWebpackPlugin, [
      [dist()],
      { root: root() },
    ])
    .end()
  .plugin('copy')
    .use(CopyPlugin, [[
      {
        from: src('images'),
        to: dist('images'),
      },
      {
        from: src('_locales'),
        to: dist('_locales'),
      },
      {
        from: src('html'),
        to: dist('html'),
      },
      {
        from: src('css', 'locales'),
        to: dist('css', 'locales'),
      },
      {
        from: src('fonts'),
        to: dist('fonts'),
      },
    ]])
    .end()
  .plugin('manifest')
    .use(ExtensionManifestPlugin, [{
      template: src(`manifest.${getBrowser()}.json`),
      version: getVersion(),
    }])
    .end()
  .plugin('extract css')
    .use(ExtractCssPlugin, [{
      filename: '[name].css',
      chunkFilename: '[id].css',
    }])
    .end()
  .plugin('changelog')
    .use(ChangelogPlugin, [{
      source: root('CHANGELOG.md'),
    }])
    .end()
  .plugin('move')
    .use(MovePlugin, [
      {
        dir: 'css',
        extension: 'css',
      },
      {
        dir: 'css',
        extension: 'css.map',
      },
      {
        dir: 'js',
        extension: 'js',
      },
      {
        dir: 'js',
        extension: 'js.map',
      },
      {
        dir: 'html',
        extension: 'html',
      },
    ])
    .end()
  .end();

// --------------------- Aliases --------------------- //

getAliases('webpack')
  .forEach(([aliasTarget, aliasPath]) => {
    config
      .resolve
        .alias
          .set(aliasTarget, aliasPath);
  });

// --------------- Common Environments --------------- //

environments
  .set('BUILD_DATE', new Date().toUTCString())
  .set('BUILD_NAME', getBuild())
  .set('BROWSER_NAME', getBrowser())
  .set('PIA_VERSION', getVersion())
  .set('COUPON', 'PIACHROME');

// ----------------- Build Specific ----------------- //

const build = getBuild();

// ------------------ Development ------------------- //

if (build === Build.DEVELOPMENT) {
  config
    .mode('development')
    .devtool('inline-source-map')
    .end();
}

// ---------------- Non-Development ----------------- //

if (build !== Build.DEVELOPMENT) {
  config
    .mode('production')
    .devtool('source-map')
    .optimization
      .minimize(false)
      .end()
    .end();
}

// ------------------ Freeze App ------------------- //

if (build === Build.DEVELOPMENT || build === Build.E2E) {
  environments
    .set('FREEZE_APP', false);
}
else {
  environments
    .set('FREEZE_APP', true);
}

// ------------------- Gitinfo --------------------- //

if (build === Build.DEVELOPMENT || build === Build.QA) {
  config
    .plugin('gitinfo')
      .use(GitInfoPlugin)
      .end()
    .end();
}

// -------------------- Pack ---------------------- //

if (build === Build.BETA || build === Build.QA || build === Build.E2E) {
  config
    .plugin('pack')
      .use(PackPlugin, [{
        apiKey: env('FIREFOX_KEY'),
        apiSecret: env('FIREFOX_SECRET'),
      }])
      .end()
    .end();
}
else if (build === Build.PUBLIC) {
  config
    .plugin('pack')
      .use(PackPlugin, [{
        apiKey: env('FIREFOX_KEY'),
        apiSecret: env('FIREFOX_SECRET'),
        // Don't want to include [build] (default behaviour)
        filename: 'private_internet_access-[browser]-v[version].[ext]',
      }])
      .end()
    .end();
}

// ---------------------- E2E ---------------------- //

if (build === Build.E2E) {
  config
    .plugin('pack')
      .tap(([opts]) => {
        return [Object.assign({}, opts, {
          replaceDist: true,
          dest: root('test', 'e2e'),
        })];
      })
      .end()
    .end();
}

// -------------------- Beta ---------------------- //

if (build === Build.BETA) {
  config
    .plugin('info')
      .use(BrowserInfoPlugin, [{}])
      .end()
    .end();
}

// ----------------- Environments ------------------ //

config
  .plugin('environment')
    .use(DefinePlugin, [environments.export()]);


// ---------------- Print Override ----------------- //

if (env('PRINT_CONFIG') === String(true)) {
  print(JSON.stringify(config.toConfig(), null, 4));
  process.exit();
}

module.exports = config.toConfig();
