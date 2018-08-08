import 'babel-polyfill';
import MockApp from './mockapp/mockApp';
import Renderer from './renderer/renderer';
import initOnError from './eventhandler/onerror';

(function initForeground() {
  let app;
  let init;
  const background = browser.extension.getBackgroundPage();

  // check to see if background app is available
  if (background) { ({ app } = background); }
  else { app = new MockApp(); }

  // check to see if we need to initialize
  if (app.initialize) { init = app.initialize(); }
  else { init = Promise.resolve(); }

  // setup global bindings
  init.then(() => {
    const renderer = new Renderer(app, window, document);
    window.debug = app.logger.debug;
    window.t = app.util.i18n.t;
    window.addEventListener('error', initOnError(app));
    return renderer;
  })
    // setup key bindings
    .then((renderer) => {
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
      return renderer;
    })
    // setup DOMContentLoaded
    .then((renderer) => {
      const pagerender = () => {
        let pollID = null;
        const { proxy } = app;
        const {
          webrtc,
          fingerprintprotection,
          httpreferer,
          networkprediction,
          hyperlinkaudit,
          trackingprotection,
        } = app.chromesettings;
        const {
          user,
          settings,
          regionlist,
          i18n,
        } = app.util;
        const firstRun = settings.getItem('firstRun');

        const pollUntilReady = () => {
          if (!user.authing && !regionlist.syncing) {
            clearInterval(pollID);
            debug('foreground.js: end polling.');
            if (firstRun) { renderer.renderTemplate('fingerprint'); }
            else if (user.authed && regionlist.synced) { renderer.renderTemplate('authenticated'); }
            else { proxy.disable().then(() => { return renderer.renderTemplate('login'); }); }
          }
        };

        const renderTemplate = () => {
          const i18nworker = i18n.worker();
          if (i18nworker) { return i18nworker.then(renderTemplate).catch(renderTemplate); }
          if (!webrtc.blockable
              || !fingerprintprotection.available
              || !httpreferer.referable
              || !browser.proxy
              || !networkprediction.available
              || !hyperlinkaudit.available
              || !trackingprotection.available) {
            return renderer.renderTemplate('upgrade_chrome');
          }

          if (!regionlist.synced) { regionlist.sync(); }

          if (regionlist.syncing || user.authing) {
            renderer.renderTemplate('please_wait');
            pollID = setInterval(pollUntilReady, 10);
            debug('foreground.js: start polling');
          }
          else if (firstRun) { renderer.renderTemplate('fingerprint'); }
          else if (user.authed) { renderer.renderTemplate('authenticated'); }
          else { proxy.disable().then(() => { return renderer.renderTemplate('login'); }); }

          /* inject locale stylesheet. */
          const link = document.createElement('link');
          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('href', `/css/locales/${i18n.locale}.css`);
          document.head.appendChild(link);
          return true;
        };
        renderTemplate();
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') { pagerender(); }
      else { document.addEventListener('DOMContentLoaded', pagerender); }
    })
    .catch((err) => { debug(err); });
}());
