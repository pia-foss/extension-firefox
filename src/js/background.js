import 'babel-polyfill';
import MockAppAdapter from 'mockapp/mockAppAdapter';

import Storage from 'util/storage';
import Settings from 'util/settings';
import Icon from 'util/icon';
import RegionList from 'util/regionlist';
import RegionSorter from 'util/regionsorter';
import User from 'util/user';
import BypassList from 'util/bypasslist';
import LatencyTest from 'util/latencytest';
import BuildInfo from 'util/buildinfo';
import Logger from 'util/logger';
import Counter from 'util/counter';
import SettingsManager from 'util/settingsmanager';
import ErrorInfo from 'util/errorinfo';
import I18n from 'util/i18n';
import PlatformInfo from 'util/platforminfo';

import HyperlinkAudit from 'chromesettings/hyperlinkaudit';
import WebRTC from 'chromesettings/webrtc';
import HttpReferer from 'chromesettings/httpreferer';
import NetworkPrediction from 'chromesettings/networkprediction';
import FingerprintProtection from 'chromesettings/fingerprintprotection';
import TrackingProtection from 'chromesettings/trackingprotection';
import BrowserProxy from 'chromesettings/proxy';

import EventHandler from 'eventhandler/eventhandler';

(async function buildBackground() {
  // build background application (self)
  const self = Object.create(null);

  // event handling and basic browser info gathering
  self.frozen = @@freezeApp;
  self.buildinfo = new BuildInfo(self);
  self.logger = new Logger(self);
  self.eventhandler = new EventHandler(self);

  // attach debugging to global scope
  window.debug = self.logger.debug;

  /* self.proxy is a ChromeSetting like self.chromesettings.* objects are. */
  self.proxy = new BrowserProxy(self);

  // message connection with foreground page
  self.adapter = new MockAppAdapter(self);

  // attach utility functions
  self.util = Object.create(null);
  self.util.platforminfo = new PlatformInfo(self);
  self.util.icon = new Icon(self);
  self.util.storage = new Storage(self);
  self.util.settings = new Settings(self);
  self.util.i18n = new I18n(self);
  self.util.regionlist = new RegionList(self);
  self.util.bypasslist = new BypassList(self);
  self.util.counter = new Counter(self);
  self.util.user = new User(self);
  self.util.latencytest = new LatencyTest(self);
  self.util.regionsorter = new RegionSorter(self);
  self.util.settingsmanager = new SettingsManager(self);
  self.util.errorinfo = new ErrorInfo(self);
  self.util = Object.freeze(self.util);

  // attach browser specific functions
  self.chromesettings = Object.create(null);
  self.chromesettings.webrtc = new WebRTC(self);
  self.chromesettings.networkprediction = new NetworkPrediction(self);
  self.chromesettings.httpreferer = new HttpReferer(self);
  self.chromesettings.hyperlinkaudit = new HyperlinkAudit(self);
  self.chromesettings.trackingprotection = new TrackingProtection(self);
  self.chromesettings.fingerprintprotection = new FingerprintProtection(self);

  // Initialization
  const reflect = (pr) => {
    return pr
      .then(() => {})
      .catch((err) => { debug(`background.js: ${err.message || err}`); });
  };
  const pendingInit = Object.values(self.chromesettings)
    .map((setting) => { return setting.init(); })
    .map(reflect);
  await Promise.all(pendingInit);
  self.chromesettings = Object.freeze(self.chromesettings);
  self.util.bypasslist.init();
  self.util.settings.init();
  await self.proxy.init();

  // check if regions are set
  const { regionlist } = self.util;
  const regionsSet = regionlist.hasRegions();
  if (!regionsSet) { regionlist.sync(); }

  // check if application should logout on close, will disable proxy as well
  let userPromise;
  const { proxy } = self;
  const { user } = self.util;
  if (user.loggedIn && user.logOutOnClose) { userPromise = user.logout(); }
  else { userPromise = Promise.resolve(); }

  userPromise
    // enable proxy if online and previously enabled
    .then(() => {
      const { storage } = self.util;
      const proxyOnline = storage.getItem('online') === 'true';
      if (user.loggedIn && proxyOnline) { return proxy.enable(); }
      return proxy.disable();
    })
    .catch((err) => {
      debug(err);
      return proxy.disable();
    });

  // attach app to background page
  window.app = Object.freeze(self);
  debug('background.js: initialized');

  if (browser.proxy) {
    browser.proxy.onProxyError.addListener((error) => {
      debug(`Proxy error: ${error.message}`);
    });
  }
})();
