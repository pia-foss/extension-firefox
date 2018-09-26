let enabled = false;

export default function(app, foreground) {
  const self = {};
  const PACify = (region) => {
    const {settings} = app.util
    return {
      type: "https",
      host: region.host,
      port: settings.getItem("maceprotection") ? region.macePort : region.port
    }
  }

  self.enabled = () => enabled;

  self.setEnabled = (value) => { enabled = value };

  self.enable = (region) => {
    // short circuit of no browser.proxy
    if (!browser.proxy) { return Promise.resolve(self); }

    const {adapter} = app;
    const {icon, regionlist, bypasslist, storage, settingsmanager} = app.util;

    let registering;
    if (foreground) { registering = adapter.sendMessage('proxy.enable'); }
    else { registering = browser.proxy.register('js/pac.js'); }

    return registering
      .then(() => {
        enabled = true;
        if (!foreground) { adapter.sendMessage('proxy.enabled', true); }
        debug("proxy.js: registered PAC script");
        debug(`bypasslist: ${JSON.stringify(bypasslist.toArray())}`);
        if (!foreground) {
          return browser.runtime.sendMessage({
            payload: PACify(regionlist.getSelectedRegion()),
            bypasslist: app.util.bypasslist.toArray()
          }, {toProxyScript: true});
        }
        else {
          return Promise.resolve();
        }
      })
      .then(() => {
        icon.online();
        settingsmanager.handleConnect();
        storage.setItem("online", "true");
        return self;
      })
      .catch((err) => {
        self._debug('error enabling proxy', err);
        throw err;
      });
  };

  self.disable = () => {
    // short circuit if no browser.proxy
    if (!browser.proxy) { return Promise.resolve(self); }

    const {adapter} = app;
    const {icon, settingsmanager, storage} = app.util;

    let unregistering;
    if (foreground) { unregistering = adapter.sendMessage('proxy.disable'); }
    else { unregistering = browser.proxy.unregister(); }

    return unregistering
      .then(() => {
        enabled = false;
        if (!foreground) {
          return app.adapter.sendMessage('proxy.enabled', false);
        }
        else {
          return Promise.resolve();
        }
      })
      .then(() => {
        debug("proxy.js: unregistered PAC script");
        icon.offline();
        settingsmanager.handleDisconnect();
        storage.setItem("online", "false");
        return self;
      })
      .catch((err) => {
        self._debug('error disabling proxy', err);
        throw err;
      });
  };

  self._debug = (msg, err) => {
    const debugMsg = `proxy.js: ${msg}`;
    debug(debugMsg);
    console.error(debugMsg);
    if (err) {
      const errMsg = `error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`;
      debug(errMsg);
      console.error(err);
    }
  };

  return self;
}
