import user            from "util/user";
import icon            from "util/icon";
import i18n            from "util/i18n";
import logger          from "util/logger";
import storage         from "util/storage";
import counter         from "util/counter";
import settings        from "util/settings";
import errorinfo       from "util/errorinfo";
import buildinfo       from "util/buildinfo";
import regionlist      from "util/regionlist";
import bypasslist      from "util/bypasslist";
import latencytest     from "util/latencytest";
import platforminfo    from "util/platforminfo";
import regionsorter    from "util/regionsorter";
import settingsmanager from "util/settingsmanager";

import webrtc                from "chromesettings/webrtc";
import httpreferer           from "chromesettings/httpreferer";
import hyperlinkaudit        from "chromesettings/hyperlinkaudit";
import networkprediction     from "chromesettings/networkprediction";
import trackingprotection    from "chromesettings/trackingprotection";
import fingerprintprotection from "chromesettings/fingerprintprotection";
import BrowserProxy          from "chromesettings/proxy";

// import eventhandler from "eventhandler/eventhandler"

export default class MockApp {

  constructor () {
    // create app object
    this.logger = new logger(this);
    this.buildinfo = new buildinfo(this);
    window.debug = this.logger.debug;

    this.chromesettings = Object.create(null);
    this.chromesettings.webrtc = new webrtc(this);
    this.chromesettings.httpreferer = new httpreferer(this);
    this.chromesettings.hyperlinkaudit = new hyperlinkaudit(this);
    this.chromesettings.networkprediction = new networkprediction(this);
    this.chromesettings.trackingprotection =  new trackingprotection(this);
    this.chromesettings.fingerprintprotection =  new fingerprintprotection(this);
    this.chromesettings = Object.freeze(this.chromesettings);

    this.proxy = new BrowserProxy(this, true);

    this.adapter = this;

    this.util = Object.create(null);
    this.util.storage = new storage(this);
    this.util.platforminfo = new platforminfo(this);
    this.util.settings = new settings(this);
    this.util.regionlist = new regionlist(this);
    this.util.bypasslist = new bypasslist(this, true);
    this.util.counter = new counter(this);
    this.util.latencytest = new latencytest(this);
    this.util.regionsorter = new regionsorter(this);
    this.util.settingsmanager = new settingsmanager(this);
    this.util.icon = new icon(this);
    this.util.user = new user(this);
    this.util.i18n = new i18n(this);
    this.util.errorinfo = new errorinfo(self);
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

  initialize () {
    return this.sendMessage('initialize').then((app) => {
      if (!app) { return Promise.resolve(); }
      // set user, proxy, and region values
      this.proxy.setEnabled(app.proxy.enabled);
      this.util.user.authed = app.util.user.authed;
      this.util.user.authing = app.util.user.authing;
      this.util.storage.setItem('form:username', app.util.user.username);
      this.util.storage.setItem('form:password', app.util.user.password);
      this.util.regionlist.setSelectedRegion(app.util.regionlist.region.id, true);
      this.util.storage.setItem('online', app.online);
      this.util.regionlist.resetFavoriteRegions(app.util.regionlist.favorites);

      // set settings values
      for(let key in app.util.settings) {
        this.util.settings.setItem(key, app.util.settings[key], true);
      }

      // set bypasslist rules
      const userRuleKey = this.util.bypasslist._storageKeys.userrk;
      const popRuleKey = this.util.bypasslist._storageKeys.poprk;
      this.util.storage.setItem(userRuleKey, app.util.bypasslist.user);
      this.util.storage.setItem(popRuleKey, app.util.bypasslist.popular);
      this.util.bypasslist.resetPopularRules();
    })
    .then(() => {
      this.util.settings.setDefaults();
      this.util.regionlist.sync()
      .then(() => {
        if(this.util.user.inStorage()) {
          if (this.util.storage.getItem('online') === 'true') {
            this.util.user.auth().then(this.proxy.enable).catch(this.proxy.disable);
          }
          else {
            this.util.user.auth().then(this.proxy.disable).catch(this.proxy.disable);
          }
        }
      }).catch((err) => { this.proxy.disable(); }); // eslint-disable-line

      if(!this.util.user.inStorage()) { this.proxy.disable(); }
    });
  }

  sendMessage (type, data) {
    return browser.runtime.sendMessage({target: 'background', type, data});
  }

  handleMessage (message, sender, response) {
    if (!message) { return; }
    if (message.target !== 'foreground') { return; }

    // can't return a promise because it's the polyfill version
    // and firefox won't recognize it as a "real" promise
    new Promise((resolve, reject) => {
      if (message.type === 'proxy.enabled') {
        this.proxy.setEnabled(message.data);
        return resolve({});
      }
      else if (message.type === 'util.user.authed') {
        this.util.user.authed = message.data.util.user.authed;
        return resolve({});
      }
      else if (message.type === 'util.user.authing') {
        this.util.user.authing = message.data.util.user.authing;
        return resolve({});
      }
      else if (message.type === 'util.regionlist.region') {
        this.util.regionlist.setSelectedRegion(message.data, true);
        return resolve({});
      }
      else if (message.type === 'requestAuthTransfer') {
        return resolve({
          username: this.util.user.username(),
          password: this.util.user.password()
        });
      }
      else { return resolve({}); }
    })
    .then(response) // eslint-disable-line dot-location
    .catch((err) => { return response(false); }); // eslint-disable-line

    // must return true here to keep the response callback alive
    return true;
  }
}
