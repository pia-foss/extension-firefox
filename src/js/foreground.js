import MockApp     from "mockapp/mockApp"
import newRenderer from "renderer/renderer"
import initOnError from "eventhandler/onerror"

(new function(window, document) {
  let app, init;
  const background = browser.extension.getBackgroundPage();

  // check to see if background app is available
  if (background) { app = background.app; }
  else { app = new MockApp(); }

  // check to see if we need to initialize
  if (app.initialize) { init = app.initialize(); }
  else { init = Promise.resolve(); }

  // setup global bindings
  init.then(() => {
    const renderer = new newRenderer(app, window, document);
    window.debug = app.logger.debug; /* eslint-ignore no-unused-vars */
    window.t = app.util.i18n.t; /* eslint-ignore no-unused-vars */
    window.addEventListener('error', initOnError(app));
    return renderer;
  })
  // setup key bindings
  .then((renderer) => {
    let lastKeyIsCtrl = false;
    const keys = {ctrl: 17, d: 68};
    const showDebugLog = (event) => {
      if(renderer.currentTemplate === "please_wait" || renderer.currentTemplate === "debuglog") {
        return false;
      }
      if(event.ctrlKey && event.keyCode === keys.d) { return true; }
      if(lastKeyIsCtrl && event.keyCode === keys.d) { return true; }
    };
    document.onkeydown = (event) => {
      if(showDebugLog(event)) { renderer.renderTemplate("debuglog"); }
      if(event.keyCode === keys.ctrl) { lastKeyIsCtrl = true; }
      else { lastKeyIsCtrl = false; }
    };
    return renderer;
  })
  // setup DOMContentLoaded
  .then((renderer) => {
    const pagerender = () => {
      let pollID = null;
      const {proxy} = app;
      const {
        webrtc,
        fingerprintprotection,
        httpreferer,
        networkprediction,
        hyperlinkaudit,
        trackingprotection} = app.chromesettings;
      const {user,regionlist,i18n} = app.util;

      const pollUntilReady = () => {
        if(!user.authing && !regionlist.syncing) {
          clearInterval(pollID);
          debug("foreground.js: end polling.");
          if(user.authed && regionlist.synced) { renderer.renderTemplate("authenticated"); }
          else { proxy.disable().then(() => renderer.renderTemplate("login")); }
        }
      };

      const renderTemplate = () => {
        const i18nworker = i18n.worker();
        if(i18nworker) { return i18nworker.then(renderTemplate).catch(renderTemplate); }
        if(!webrtc.blockable ||
           !fingerprintprotection.available ||
           !httpreferer.referable ||
           !browser.proxy ||
           !networkprediction.available ||
           !hyperlinkaudit.available ||
           !trackingprotection.available) {
          return renderer.renderTemplate("upgrade_chrome");
        }

        if(!regionlist.synced) { regionlist.sync(); }

        if(regionlist.syncing || user.authing) {
          renderer.renderTemplate("please_wait");
          pollID = setInterval(pollUntilReady, 10);
          debug("foreground.js: start polling");
        }
        else if(user.authed) { renderer.renderTemplate("authenticated"); }
        else { proxy.disable().then(() => renderer.renderTemplate("login")); }

        /* inject locale stylesheet. */
        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", `/css/locales/${i18n.locale}.css`);
        document.head.appendChild(link);
      }
      renderTemplate();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') { pagerender(); }
    else { document.addEventListener('DOMContentLoaded', pagerender); }
  })
  .catch((err) => { console.log(err); });
}(window, document))
