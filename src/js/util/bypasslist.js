export default function(app, foreground) {
  const storageKeys = {userrk: "bypasslist:customlist", poprk:"bypasslist:popularrules"};
  const {storage, regionlist} = app.util;
  const trimUserRules = (rules) => rules.map(e => e.trim()).filter(e => e.length > 0);
  const enabledRules = new Map([
    ["privatenetworks", []],
    ["pinggateways", () => regionlist.toArray().map((r) => `http://${r.host}:8888`)],
    [storageKeys.userrk, []],
    [storageKeys.poprk, []]
  ]);
  const popularRules = new Map([
    ["netflix", ["https://netflix.com",
                 "https://*.netflix.com",
                 "https://*.nflxvideo.net",
                 "https://*.nflximg.net"]],
    ["hulu", ["https://*.hulu.com", "https://*.hulustream.com"]]
  ]);

  this.popularRulesStorageKey = storageKeys.poprk;
  this.userRulesStorageKey = storageKeys.userrk;
  this.isRuleEnabled = (ruleName) => enabledRules.has(ruleName);
  this.popularRulesByName = () => Array.from(popularRules.keys());
  this.getUserRules = () => trimUserRules(Array.from(enabledRules.get(storageKeys.userrk)));
  this.visibleSize = () => this.getUserRules().length + this.enabledPopularRules().length;


  this.setUserRules = (rules, bridged) => {
    const {adapter} = app;
    storage.setItem(storageKeys.userrk, trimUserRules(Array.from(rules)).join(","))
    enabledRules.set(storageKeys.userrk, rules)
    if (!bridged) { adapter.sendMessage('setUserRules', rules); }
    return this.getUserRules();
  }

  this.addUserRule = (string) => {
    if (string.endsWith('/')) { string = string.substring(0, string.length - 1); }
    const userRules = this.getUserRules();
    userRules.push(string);
    this.setUserRules([... new Set(userRules)]);
  }

  this.removeUserRule = (string) => {
    const rules = this.getUserRules();
    this.setUserRules(rules.filter(e => e !== string));
  }

  this.enablePopularRule = (name, bridged) => {
    if(!this.popularRulesByName().includes(name)) { return; }

    const {proxy, adapter} = app;

    return new Promise((resolve, reject) => {
      // enable rule
      enabledRules.set(name, popularRules.get(name));

      // ensure mock app is aware of this change
      if (!bridged) { return resolve(adapter.sendMessage('enablePopularRule', name)); }
      else { return resolve(); }
    })
    .then(() => {
      if(!foreground && proxy.enabled()) { return proxy.enable(regionlist.getSelectedRegion()); }
    })
    .then(() => {
      storage.setItem(storageKeys.poprk, this.enabledPopularRules().join(','));
      debug(`bypasslist: added ${name}`);
    })
  }

  this.disablePopularRule = (name, bridged) => {
    if(!this.popularRulesByName().includes(name)) { return; }

    const {proxy, adapter} = app;

    return new Promise((resolve, reject) => {
      if(enabledRules.has(name)) {
        enabledRules.delete(name);

        if (!bridged) { return resolve(adapter.sendMessage('disablePopularRule', name)); }
        else { return resolve(); }
      }
      else { return reject(new Error('rule not found')); }
    })
    .then(() => {
      if(!foreground && proxy.enabled()) { return proxy.enable(regionlist.getSelectedRegion()); }
    })
    .then(() => {
      storage.setItem(storageKeys.poprk, this.enabledPopularRules().join(','));
      debug(`bypasslist: removed ${name}`);
    })
    .catch((err) => {
      if (err.message === 'rule not found') { return ''; }
    });
  }

  this.enabledPopularRules = () => {
    const enabledRulesByName = Array.from(enabledRules.keys());
    const popularRulesByName = this.popularRulesByName();
    return popularRulesByName.filter((name) => enabledRulesByName.includes(name));
  }

  this.toArray = () => {
    const rules = [...Array.from(enabledRules.values())];
    return [].concat(...rules.map((r) => { return typeof(r) === "function" ? r() : r }));
  }

  this.resetPopularRules = (rules) => {
    // turn off all popular rules
    this.popularRulesByName().map((rule) => {
      return this.disablePopularRule(rule, true);
    });

    // turn on popular and user rules from storage
    const {userrk, poprk} = storageKeys;
    if(storage.hasItem(poprk) && storage.getItem(poprk).length > 0) {
      storage.getItem(poprk).split(',').forEach((name) => this.enablePopularRule(name, true));
    }

    if(storage.hasItem(userrk)) {
      this.setUserRules(storage.getItem(userrk).split(','), true);
    }
  }

  // init
  if (!foreground) {
    const {userrk, poprk} = storageKeys;

    if(storage.hasItem(userrk) && storage.getItem(userrk).length > 0) {
      this.setUserRules(storage.getItem(userrk).split(','));
    }

    if(storage.hasItem(poprk) && storage.getItem(poprk).length > 0) {
      storage.getItem(poprk).split(',').forEach((name) => this.enablePopularRule(name));
    }
  }

  return this;
}
