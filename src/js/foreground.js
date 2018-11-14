import 'babel-polyfill';
import MockApp from 'mockapp/mockApp';
import Renderer from 'renderer/renderer';
import initOnError from 'eventhandler/onerror';

// check to see if background app is available
let app;
const background = browser.extension.getBackgroundPage();
if (background) { ({ app } = background); }
else { app = new MockApp(); }
if (!background) { window.app = app; } // in PB Mode, put app on window

// create react template renderer
const renderer = new Renderer();
if (background) { background.renderer = renderer; }
else { window.renderer = renderer; } // in PB Mode, put renderer on window

// check to see if we need to initialize
let init;
if (app.initialize) { init = app.initialize(); }
else { init = Promise.resolve(); }

init
  // setup global bindings
  .then(() => {
    window.debug = app.logger.debug;
    window.t = app.util.i18n.t;
    window.addEventListener('error', initOnError(app));
  })
  // inject locale stylesheet
  .then(() => {
    const { i18n } = app.util;
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', `/css/locales/${i18n.locale}.css`);
    document.head.appendChild(link);
  })
  // setup i18n
  .then(() => {
    const { i18n } = app.util;
    const i18nworker = i18n.worker();
    if (i18nworker) { return i18nworker; }
    return Promise.resolve();
  })
  // check on dom ready
  .then(() => {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') { resolve(); }
      else { document.addEventListener('DOMContentLoaded', resolve); }
    });
  })
  // setup key bindings
  .then(() => {
    let lastKeyIsCtrl = false;
    const keys = { ctrl: 17, d: 68 };
    const showDebugLog = (event) => {
      let showRenderer = false;
      if (renderer.currentTemplate === 'please_wait') { showRenderer = false; }
      else if (renderer.currentTemplate === 'debuglog') { showRenderer = false; }
      else if (event.ctrlKey && event.keyCode === keys.d) { showRenderer = true; }
      else if (lastKeyIsCtrl && event.keyCode === keys.d) { showRenderer = true; }
      return showRenderer;
    };

    document.onkeydown = (event) => {
      if (showDebugLog(event)) { renderer.renderTemplate('debuglog'); }
      if (event.keyCode === keys.ctrl) { lastKeyIsCtrl = true; }
      else { lastKeyIsCtrl = false; }
    };
  })
  // start the loading animation
  .then(() => { renderer.renderTemplate('please_wait'); })
  // check if regions need to be synched
  .then(() => {
    const { regionlist } = app.util;
    if (!regionlist.hasRegions()) { regionlist.sync(); }
  })
  // capability checks
  .then(() => {
    const {
      webrtc,
      fingerprintprotection,
      httpreferer,
      networkprediction,
      hyperlinkaudit,
      trackingprotection,
    } = app.chromesettings;

    if (!webrtc.blockable
        || !fingerprintprotection.available
        || !httpreferer.referable
        || !browser.proxy
        || !networkprediction.available
        || !hyperlinkaudit.available
        || !trackingprotection.available) { return true; }
    return false;
  })
  // render view
  .then((needsUpgrade) => {
    const firstRun = app.util.settings.getItem('firstRun', true);
    if (needsUpgrade) { renderer.renderTemplate('upgrade_chrome'); }
    else if (firstRun) { renderer.renderTemplate('fingerprint'); }
    else if (app.util.user.loggedIn) { renderer.renderTemplate('authenticated'); }
    else { app.proxy.disable().then(() => { return renderer.renderTemplate('login'); }); }
  })
  .catch((err) => { debug(err); });
