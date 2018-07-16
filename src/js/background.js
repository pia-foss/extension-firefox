import "babel-polyfill";
import MockAppAdapter from "mockapp/mockAppAdapter";

import storage            from "util/storage";
import settings           from "util/settings";
import icon               from "util/icon";
import regionlist         from "util/regionlist";
import regionsorter       from "util/regionsorter";
import user               from "util/user";
import bypasslist         from "util/bypasslist";
import latencytest        from "util/latencytest";
import buildinfo          from "util/buildinfo";
import Logger             from "util/logger";
import counter            from "util/counter";
import settingsmanager    from "util/settingsmanager";
import errorinfo          from "util/errorinfo";
import i18n               from "util/i18n";
import platforminfo       from "util/platforminfo";

import hyperlinkaudit        from "chromesettings/hyperlinkaudit";
import webrtc                from "chromesettings/webrtc";
import httpreferer           from "chromesettings/httpreferer";
import networkprediction     from "chromesettings/networkprediction";
import fingerprintprotection from "chromesettings/fingerprintprotection";
import trackingprotection    from "chromesettings/trackingprotection";
import BrowserProxy          from "chromesettings/proxy";

import eventhandler from "eventhandler/eventhandler";

(function () {
  const self = Object.create(null);

  self.frozen = @@freezeApp;
  self.buildinfo    = new buildinfo(self);
  self.logger       = new Logger(self);
  self.eventhandler = new eventhandler(self);
  window.debug = self.logger.debug /* eslint-ignore no-unused-vars */

  /* self.proxy is a ChromeSetting like self.chromesettings.* objects are. */
  self.proxy = BrowserProxy(self);

  // message connection with foreground page
  self.adapter = new MockAppAdapter(self);

  self.util = Object.create(null);
  self.util.platforminfo       = new platforminfo(self);
  self.util.icon               = new icon(self);
  self.util.storage            = new storage(self);
  self.util.settings           = new settings(self);
  self.util.i18n               = new i18n(self);
  self.util.regionlist         = new regionlist(self);
  self.util.bypasslist         = new bypasslist(self);
  self.util.counter            = new counter(self);
  self.util.user               = new user(self);
  self.util.latencytest        = new latencytest(self);
  self.util.regionsorter       = new regionsorter(self);
  self.util.settingsmanager    = new settingsmanager(self);
  self.util.errorinfo          = new errorinfo(self);
  self.util = Object.freeze(self.util);

  self.chromesettings = Object.create(null);
  self.chromesettings.webrtc             = new webrtc(self);
  self.chromesettings.networkprediction  = new networkprediction(self);
  self.chromesettings.httpreferer        = new httpreferer(self);
  self.chromesettings.hyperlinkaudit     = new hyperlinkaudit(self);
  self.chromesettings.trackingprotection = new trackingprotection(self);
  self.chromesettings.fingerprintprotection = new fingerprintprotection(self);
  self.chromesettings = Object.freeze(self.chromesettings);

  self.util.bypasslist.init();

  (() => {
    const {proxy} = self;
    const {user,settings,storage,regionlist} = self.util;
    settings.setDefaults();

    regionlist.sync().then(() => {
      if(user.inStorage()) {
        if(storage.getItem("online") === "true"){
          user.auth().then(proxy.enable).catch(proxy.disable);
        }
        else { user.auth().then(proxy.disable).catch(proxy.disable); }
      }
    }).catch(proxy.disable);

    if(!user.inStorage()) { proxy.disable(); }

    window.app = Object.freeze(self);
    debug("background.js: initialized");
  })();

  // PAC error messages
  if (browser.proxy) {
    browser.proxy.onProxyError.addListener((error) => {
      debug(`Proxy error: ${error.message}`);
    });
  }
}());
