import User from 'util/user';
import Icon from 'util/icon';
import I18n from 'util/i18n';
import Logger from 'util/logger';
import Storage from 'util/storage';
import Counter from 'util/counter';
import Settings from 'util/settings';
import ErrorInfo from 'util/errorinfo';
import BuildInfo from 'util/buildinfo';
import RegionList from 'util/regionlist';
import BypassList from 'util/bypasslist';
import LatencyTest from 'util/latencytest';
import PlatformInfo from 'util/platforminfo';
import RegionSorter from 'util/regionsorter';
import SettingsManager from 'util/settingsmanager';

import WebRTC from 'chromesettings/webrtc';
import HttpReferer from 'chromesettings/httpreferer';
import HyperlinkAudit from 'chromesettings/hyperlinkaudit';
import NetworkPrediction from 'chromesettings/networkprediction';
import TrackingProtection from 'chromesettings/trackingprotection';
import FingerprintProtection from 'chromesettings/fingerprintprotection';
import BrowserProxy from 'chromesettings/proxy';

import {
  Target,
  isTarget,
  sendMessage,
  Type,
} from 'helpers/messaging';

export default class MockApp {
  constructor() {
    // create app object
    this.target = Target.BACKGROUND;
    this.logger = new Logger(this);
    this.buildinfo = new BuildInfo(this);
    window.debug = this.logger.debug;

    this.chromesettings = Object.create(null);
    this.chromesettings.webrtc = new WebRTC(this);
    this.chromesettings.httpreferer = new HttpReferer(this);
    this.chromesettings.hyperlinkaudit = new HyperlinkAudit(this);
    this.chromesettings.networkprediction = new NetworkPrediction(this);
    this.chromesettings.trackingprotection = new TrackingProtection(this);
    this.chromesettings.fingerprintprotection = new FingerprintProtection(this);
    this.chromesettings = Object.freeze(this.chromesettings);

    this.proxy = new BrowserProxy(this, true);

    this.adapter = this;

    this.util = Object.create(null);
    this.util.storage = new Storage(this);
    this.util.platforminfo = new PlatformInfo(this);
    this.util.settings = new Settings(this);
    this.util.regionlist = new RegionList(this, true);
    this.util.bypasslist = new BypassList(this, true);
    this.util.counter = new Counter(this);
    this.util.latencytest = new LatencyTest(this);
    this.util.regionsorter = new RegionSorter(this);
    this.util.settingsmanager = new SettingsManager(this);
    this.util.icon = new Icon(this);
    this.util.user = new User(this);
    this.util.i18n = new I18n(this);
    this.util.errorinfo = new ErrorInfo(this);
    this.util = Object.freeze(this.util);

    // NOTE: Do not initialize the bypass list here,
    // it will be taken care of in the initialize function below

    // TODO: doesn't work because of babel running too late
    // this.eventhandler = new eventhandler(self);

    // bindings
    this.initialize = this.initialize.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);

    // message handling
    browser.runtime.onMessage.addListener(this.handleMessage);
  }

  async initialize() {
    try {
      const app = await this.sendMessage('initialize');

      // Initialize settings
      if (app) {
        // initialize settings localStorage
        // it is critical the settings are intiialized before setting up the user
        // to ensure 'remember me' is set and user credentials are saved to the
        // correct storage location via setUsername and setPassword
        app.util.settings.forEach(({ settingID, value }) => {
          this.util.settings.setItem(settingID, value, true);
        });
      }
      const reflect = (pr) => {
        return pr
          .then(() => {})
          .catch((err) => { debug(`background.js: ${err.message || err}`); });
      };
      const pendingInit = Object.values(this.chromesettings)
        .map((setting) => { return setting.init(); })
        .map(reflect);
      await Promise.all(pendingInit);

      if (app) {
        // set user, proxy, and region values
        this.proxy.setLevelOfControl(app.proxy.levelOfControl);
        this.util.user.authed = app.util.user.authed;
        this.util.user.authing = app.util.user.authing;
        this.util.user.setLoggedInStorageItem(app.util.user.loggedIn);
        this.util.user.setUsername(app.util.user.username, true);
        this.util.user.setPassword(app.util.user.password, true);
        this.util.storage.setItem('online', app.online);
        this.util.regionlist.import(app.util.regionlist.regions);
        await this.util.regionlist.setSelectedRegion(app.util.regionlist.region.id, true);
        this.util.regionlist.resetFavoriteRegions(app.util.regionlist.favorites);

        // set bypasslist rules
        const userRuleKey = this.util.bypasslist.storageKeys.userrk;
        const popRuleKey = this.util.bypasslist.storageKeys.poprk;
        this.util.storage.setItem(userRuleKey, app.util.bypasslist.user);
        this.util.storage.setItem(popRuleKey, app.util.bypasslist.popular);
        this.util.bypasslist.resetPopularRules();
      }

      await this.proxy.init();
    }
    catch (err) {
      debug('mockApp.js: error occurred');
      debug(`error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
    }
  }

  async sendMessage(type, data) {
    let message;
    try {
      message = await sendMessage(this.target, type, data);
    }
    catch (err) {
      debug('mockApp.js: error');
      debug(`error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      throw err;
    }

    return message;
  }

  handleMessage(message, sender, response) {
    if (!isTarget(message, Target.FOREGROUND)) { return false; }

    // can't return a promise because it's the polyfill version
    // and firefox won't recognize it as a 'real' promise
    new Promise(async (resolve) => {
      if (message.type === 'util.user.authed') {
        this.util.user.authed = message.data;
      }
      else if (message.type === 'util.user.authing') {
        this.util.user.authing = message.data;
      }
      else if (message.type === Type.SET_SELECTED_REGION) {
        await this.util.regionlist.setSelectedRegion(message.data, true);
      }

      return resolve({});
    })
      .then(response)
      .catch(() => { return response(false); });

    // must return true here to keep the response callback alive
    return true;
  }
}
