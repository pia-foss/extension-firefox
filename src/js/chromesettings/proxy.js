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

    let promise;
    if (foreground) { promise = adapter.sendMessage('proxy.enable'); }
    else { promise = browser.proxy.register('js/pac.js'); }

    return promise.then(() => {
      enabled = true;
      if (!foreground) { adapter.sendMessage('proxy.enabled', true); }
      debug("proxy.js: registered PAC script");
      debug(`bypasslist: ${JSON.stringify(bypasslist.toArray())}`);
      if (!foreground) {
        browser.runtime.sendMessage({
          payload: PACify(regionlist.getSelectedRegion()),
          bypasslist: app.util.bypasslist.toArray()
        }, {toProxyScript: true});
      }
      icon.online();
      settingsmanager.handleConnect();
      storage.setItem("online", "true");
      return self;
    });
  }

  self.disable = () => {
    // short circuit if no browser.proxy
    if (!browser.proxy) { return Promise.resolve(self); }

    const {adapter} = app;
    const {icon, settingsmanager, storage} = app.util;

    let promise;
    if (foreground) { promise = adapter.sendMessage('proxy.disable'); }
    else { promise = browser.proxy.unregister(); }

    return promise.then(() => {
      enabled = false;
      if (!foreground) { app.adapter.sendMessage('proxy.enabled', false); }
      debug("proxy.js: unregistered PAC script");
      icon.offline();
      settingsmanager.handleDisconnect();
      storage.setItem("online", "false");
      return self;
    });
  }

  return self;
}
