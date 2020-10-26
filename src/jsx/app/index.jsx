import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

import '@style/pia';
import MockApp from '@mockapp/mockApp';
import applyOnError from '@eventhandler/onError';
import { sendMessage, Target, Type } from '@helpers/messaging';
import App from './app';

// check to see if background app is available
let app;
const background = browser.extension.getBackgroundPage();
if (background) { ({ app } = background); }
else { app = new MockApp(); }
if (!background) { window.app = app; } // in PB Mode, put app on window

// check to see if we need to initialize
let init;
if (app.initialize) { init = app.initialize(); }
else { init = Promise.resolve(); }

init
  // setup global bindings
  .then(() => {
    window.debug = app.logger.debug;
    window.t = app.util.i18n.t;
    applyOnError(app, {
      addListener(listener) {
        window.addEventListener('error', listener);
      },
    });
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
  // render App
  .then(() => {
    ReactDOM.render(
      (
        <MemoryRouter>
          <App />
        </MemoryRouter>
      ),
      document.getElementById('page-content'),
    );
  })
  // send frontend started message
  .then(() => {
    return sendMessage(Target.ALL, Type.FOREGROUND_OPEN);
  })
  .catch((err) => { debug(err); });
