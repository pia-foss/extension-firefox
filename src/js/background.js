import '@babel/polyfill';

import MockAppAdapter from '@mockapp/mockAppAdapter';

import Storage from '@util/storage';
import Settings from '@util/settings';
import Icon from '@util/icon';
import RegionList from '@util/regionlist';
import RegionSorter from '@util/regionsorter';
import User from '@util/user';
import BypassList from '@util/bypasslist';
import LatencyManager from '@util/latencymanager';
import BuildInfo from '@util/buildinfo';
import Logger from '@util/logger';
import Counter from '@util/counter';
import SettingsManager from '@util/settingsmanager';
import ErrorInfo from '@util/errorinfo';
import I18n from '@util/i18n';
import PlatformInfo from '@util/platforminfo';
import HttpsUpgrade from '@util/https-upgrade';
import SmartLocation from '@util/smart-location';
import IpManager from '@util/ipmanager';

import HyperlinkAudit from '@chromesettings/hyperlinkaudit';
import WebRTC from '@chromesettings/webrtc';
import HttpReferer from '@chromesettings/httpreferer';
import NetworkPrediction from '@chromesettings/networkprediction';
import FingerprintProtection from '@chromesettings/fingerprintprotection';
import TrackingProtection from '@chromesettings/trackingprotection';
import BrowserProxy from '@chromesettings/proxy';
import UrlParser from '@helpers/url-parser';

import EventHandler from '@eventhandler/eventhandler';

function isFrozen() {
  return process.env.FREEZE_APP === true;
}

// build background application (self)
const self = Object.create(null);

// basic browser info gathering
// eslint-disable-next-line
self.frozen = isFrozen();
self.buildinfo = new BuildInfo(self);
self.logger = new Logger(self);

// attach debugging to global scope
window.debug = self.logger.debug;

/* self.proxy is a ChromeSetting like self.chromesettings.* objects are. */
self.proxy = new BrowserProxy(self);

// message connection with foreground page
self.adapter = new MockAppAdapter(self);

// attach utility functions
self.util = Object.create(null);
self.helpers = Object.create(null);
self.util.platforminfo = new PlatformInfo(self);
self.util.icon = new Icon(self);
self.util.storage = new Storage(self);
self.util.settings = new Settings(self);
self.util.i18n = new I18n(self);
self.util.regionlist = new RegionList(self);
self.util.bypasslist = new BypassList(self);
self.util.counter = new Counter(self);
self.util.user = new User(self);
self.util.latencymanager = new LatencyManager(self);
self.util.regionsorter = new RegionSorter(self);
self.util.settingsmanager = new SettingsManager(self);
self.util.errorinfo = new ErrorInfo(self);
self.util.httpsUpgrade = new HttpsUpgrade(self);
self.util.smartlocation = new SmartLocation(self);
self.util.ipManager = new IpManager(self);
self.util = Object.freeze(self.util);

// setup event handler
self.eventhandler = new EventHandler(self);

// attach browser specific functions
 self.contentsettings = Object.create(null);

// attach browser specific functions
self.chromesettings = Object.create(null);
self.chromesettings.webrtc = new WebRTC(self);
self.chromesettings.networkprediction = new NetworkPrediction(self);
self.chromesettings.httpreferer = new HttpReferer(self);
self.chromesettings.hyperlinkaudit = new HyperlinkAudit(self);
self.chromesettings.trackingprotection = new TrackingProtection(self);
self.chromesettings.fingerprintprotection = new FingerprintProtection(self);

self.helpers.UrlParser = new UrlParser(); 
  // Initialize all functions
  const initSettings = async (settings) => {
    const pending = Object.values(settings)
      .filter((setting) => { return setting.init; })
      .map((setting) => { return setting.init(); });
    await Promise.all(pending);
  };

   initSettings(self.chromesettings);
   initSettings(self.contentsettings);

// Initialization
const reflect = (pr) => {
  return pr.catch((err) => { debug(`background.js: ${err.message || err}`); });
};

const pendingInit = Object.values(self.chromesettings)
  .map((setting) => { return setting.init(); })
  .map(reflect);

(async function buildBackground() {
  await Promise.all(pendingInit);
  self.chromesettings = Object.freeze(self.chromesettings);
  self.util.bypasslist.init();
  self.util.settings.init();
  self.util.smartlocation.init();

  // check if regions are set
  const { regionlist } = self.util;
  regionlist.sync();

  // check if application should logout on close, will disable proxy as well
  const { proxy, util: { user } } = self;

  

  Promise.resolve()
    .then(() => { return user.init(); })
    // enable proxy if online and previously enabled
    .then(async () => {
      //when a tab is activated
      chrome.tabs.onActivated.addListener((activeInfo)=>{
        self.util.icon.upatedOnChangeTab(activeInfo.tabId)
      })

      chrome.windows.onCreated.addListener(function() {
        self.util.user.checkUserName();
      })
    
      //when a tab is updated
      chrome.tabs.onUpdated.addListener((tabId)=>{
        self.util.icon.upatedOnChangeTab(tabId)
      })
    
      const shouldSetProxyOnline = self.util.storage.getItem('online') === String(true);
      const controllable = self.proxy.isControllable();
      const loggedIn = self.util.user.getLoggedIn();
      
      if (loggedIn && controllable && shouldSetProxyOnline) {
        await self.proxy.enable();
      }
      else {
        await self.proxy.disable();
      }
    })
    .catch((err) => {
      debug(err);
      return self.proxy.disable();
    });

  // attach app to background page
  window.app = Object.freeze(self);
  debug('background.js: initialized');

})();
