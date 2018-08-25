import { File } from '../helpers/file';

export default class BypassList {
  constructor (app, foreground) {
    // Bindings
    this._trimUserRules = this._trimUserRules.bind(this);
    this._initialRules = this._initialEnabledRules.bind(this);
    this.init = this.init.bind(this);
    this.generatePingGateways = this.generatePingGateways.bind(this);
    this.updatePingGateways = this.updatePingGateways.bind(this);
    this.isRuleEnabled = this.isRuleEnabled.bind(this);
    this.popularRulesByName = this.popularRulesByName.bind(this);
    this.getUserRules = this.getUserRules.bind(this);
    this.visibleSize = this.visibleSize.bind(this);
    this.restartProxy = this.restartProxy.bind(this);
    this.setUserRules = this.setUserRules.bind(this);
    this.addUserRule = this.addUserRule.bind(this);
    this.removeUserRule = this.removeUserRule.bind(this);
    this.enablePopularRule = this.enablePopularRule.bind(this);
    this.disablePopularRule = this.disablePopularRule.bind(this);
    this.enabledPopularRules = this.enabledPopularRules.bind(this);
    this.toArray = this.toArray.bind(this);
    this.resetPopularRules = this.resetPopularRules.bind(this);
    this.saveRulesToFile = this.saveRulesToFile.bind(this);
    this.importRules = this.importRules.bind(this);
    this.spawnImportTab = this.spawnImportTab.bind(this);

    // Init
    this._app = app;
    this._foreground = foreground;
    this._storage = app.util.storage;
    this._regionList = app.util.regionlist;
    this._storageKeys = {userrk: "bypasslist:customlist", poprk:"bypasslist:popularrules"};
    this._enabledRules = this._initialEnabledRules();
  }

  _trimUserRules (rules) {
    return rules.map(e => e.trim()).filter(e => e.length > 0);
  }

  _initialEnabledRules() {
    return new Map([
      ['privatenetworks',
        [
          '0.0.0.0/8',
          '10.0.0.0/8',
          '127.0.0.0/8',
          '169.254.0.0/16',
          '192.168.0.0/16',
          '172.16.0.0/12',
          '::1',
          'localhost',
          '*.local'
        ]
      ],
      ['pinggateways', this.generatePingGateways()],
      [this._storageKeys.userrk, []],
      [this._storageKeys.poprk, []]
    ]);
  }

  get _popularRules () {
    const netflix = [
      "https://netflix.com",
      "https://*.netflix.com",
      "https://*.nflxvideo.net",
      "https://*.nflximg.net",
    ];
    const hulu = [
      "https://*.hulu.com",
      "https://*.hulustream.com",
    ];
    return Object.freeze(new Map([
      ['netflix', netflix],
      ['hulu', hulu],
    ]));
  }

  set _popularRules (_) {
    throw new Error(debug('popular rules are read only at runtime'));
  }

  init () {
    const {userrk, poprk} = this._storageKeys;
    if(this._storage.hasItem(userrk) && this._storage.getItem(userrk).length > 0) {
      this.setUserRules(this._storage.getItem(userrk).split(","));
    }

    if(this._storage.hasItem(poprk) && this._storage.getItem(poprk).length > 0) {
      this._storage.getItem(poprk).split(',').forEach((name) => this.enablePopularRule(name));
    }
  }

  generatePingGateways () {
    let http = this._regionList.toArray().map((r) => {
      return `http://${r.host}:8888`;
    });

    let https = this._regionList.toArray().map((r) => {
      return `https://${r.host}:8888`;
    });

    return http.concat(https);
  }

  updatePingGateways () {
    this._enabledRules.set('pinggateways', this.generatePingGateways());
    if(this._app.proxy.enabled()) {
      this._app.proxy.enable(this._regionList.getSelectedRegion());
    }
  }

  isRuleEnabled (ruleName) {
    return this._enabledRules.has(ruleName);
  }

  popularRulesByName () {
    return Array.from(this._popularRules.keys());
  }

  getUserRules () {
    return this._trimUserRules(Array.from(this._enabledRules.get(this._storageKeys.userrk)));
  }

  visibleSize () {
    return this.getUserRules().length + this.enabledPopularRules().length;
  }

  restartProxy (cb = () => {}) {
    const {proxy} = this._app;
    if (!proxy) {
      throw new Error(debug('proxy not ready'));
    }
    if (!proxy) {
      throw new Error(debug('proxy is not available'));
    }
    if (proxy.enabled()) {
      return void proxy.enable(this._regionList.getSelectedRegion()).then(cb);
    } else {
      return void cb();
    }
  }

  setUserRules (rules, bridged) {
    const {adapter} = this._app;
    this._storage.setItem(this._storageKeys.userrk, this._trimUserRules(Array.from(rules)).join(','));
    this._enabledRules.set(this._storageKeys.userrk, rules);
    if (!bridged) { adapter.sendMessage('setUserRules', rules); }
    return this.getUserRules();
  }

  addUserRule (string, bridged, restartProxy = false) {
    if (string.endsWith('/')) { string = string.substring(0, string.length - 1); }
    const userRules = this.getUserRules();
    userRules.push(string);
    this.setUserRules([...new Set(userRules)]);
    if (restartProxy) { this.restartProxy(); }
  }

  removeUserRule (string, restartProxy = false) {
    if (string.endsWith('/')) { string = string.substring(0, string.length - 1); }
    const rules = this.getUserRules();
    this.setUserRules(rules.filter(e => e !== string));
    if (restartProxy) { this.restartProxy(); }
  }

  enablePopularRule (name, bridged, restartProxy = true) {
    if (!this.popularRulesByName().includes(name)) { return; }
    if (this.enabledPopularRules().includes(name)) { return; }

    const {adapter} = this._app;

    return new Promise((resolve, reject) => {
      // enable rule
      this._enabledRules.set(name, this._popularRules.get(name));

      // ensure mock app is aware of this change
      // TODO: send the restartProxy params over to adapter
      if (!bridged) {
        return resolve(adapter.sendMessage('enablePopularRule', {name, restartProxy}));
      }
      else { return resolve(); }
    })
    .then(() => {
      if(!this._foreground && restartProxy) { return this.restartProxy(); }
    })
    .then(() => {
      this._storage.setItem(this._storageKeys.poprk, this.enabledPopularRules().join(','));
      debug(`bypasslist: added ${name}`);
    });
  }

  disablePopularRule (name, bridged, restartProxy = true) {
    if (!this.popularRulesByName().includes(name)) { return; }
    if (!this.enabledPopularRules().includes(name)) { return; }

    const {adapter} = this._app;

    return new Promise((resolve, reject) => {
      // disable rule
      this._enabledRules.delete(name);

      // ensure mock app is aware of this change
      if (!bridged) {
        return resolve(adapter.sendMessage('disablePopularRule', {name, restartProxy}));
      }
      else { return resolve(); }
    })
    .then(() => {
      if(!this._foreground && restartProxy) { return this.restartProxy(); }
    })
    .then(() => {
      this._storage.setItem(this._storageKeys.poprk, this.enabledPopularRules().join(","));
      debug(`bypasslist: removed ${name}`);
    });
  }

  enabledPopularRules () {
    const enabledRulesByName = Array.from(this._enabledRules.keys());
    const popularRulesByName = this.popularRulesByName();
    return popularRulesByName.filter((name) => enabledRulesByName.includes(name));
  }

  toArray () {
    const rules = [...Array.from(this._enabledRules.values())];
    return [].concat(...rules.map((r) => { return typeof(r) === "function" ? r() : r; }));
  }

  resetPopularRules (rules) {
    // turn off all popular rules
    this.popularRulesByName().map((rule) => {
      return this.disablePopularRule(rule, true);
    });

    // turn on popular and user rules from storage
    const {userrk, poprk} = this._storageKeys;
    if(this._storage.hasItem(poprk) && this._storage.getItem(poprk).length > 0) {
      this._storage.getItem(poprk).split(',').forEach((name) => this.enablePopularRule(name, true));
    }

    if(this._storage.hasItem(userrk)) {
      this.setUserRules(this._storage.getItem(userrk).split(','), true);
    }
  }

  /**
   * Create a file containing the current ruleset and download it on client
   *
   * @returns {void}
   */
  saveRulesToFile () {
    const payload = JSON.stringify({
      popularRules: this.enabledPopularRules(),
      userRules: this.getUserRules(),
    });
    const file = new File('application/json', [payload]);
    file.download('bypass-rules.json');
  }

  /**
   * Import the specified rule sets into the application
   *
   * @param {object} rules Set of rules to import
   * @returns {void}
   */
  importRules ({userRules, popularRules}) {
    const importRuleSet = (importedRules, getRules, enableRule, disableRule) => {
      if (Array.isArray(importedRules)) {
        // Disable rules not in importedRules
        getRules().forEach(rule => {
          if (!importedRules.includes(rule)) {
            disableRule(rule);
          }
        });
        // Enable importedRules
        importedRules.forEach(enableRule);
        // Disable all rules
      }
      else if (typeof importedRules === 'undefined') {
        getRules().forEach(disableRule);
      }
      else { debug('rule set is invalid type, expected array'); }
    };
    try {
      importRuleSet(
        userRules,
        this.getUserRules,
        name => this.addUserRule(name, false),
        name => this.removeUserRule(name, false)
      );
      importRuleSet(
        popularRules,
        this.enabledPopularRules,
        (name) => this.enablePopularRule(name, false, false),
        (name) => this.disablePopularRule(name, false, false)
      );
      this.restartProxy();
    } catch (err) {
      debug(`failed to update rules with error: ${err}`);
    }
  }

  /**
   * Create a new popup window for importing rules file
   *
   * @returns {void}
   */
  spawnImportTab () {
    const width = 400;
    const height = 400;
    browser.windows.create({
      url: browser.extension.getURL('html/popups/importrules.html'),
      type: 'popup',
      width,
      height,
    });
  }
}
