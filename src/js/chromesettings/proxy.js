import { sendMessage, Type, Target } from 'helpers/messaging';

let enabled = false;

class Proxy {
  constructor(app, foreground) {
    this.app = app;
    this.foreground = foreground;

    // bindings
    this.enabled = this.enabled.bind(this);
    this.getEnabled = this.getEnabled.bind(this);
    this.setEnabled = this.setEnabled.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
  }

  enabled() {
    return this.getEnabled();
  }

  // eslint-disable-next-line class-methods-use-this
  getEnabled() {
    return enabled;
  }

  // eslint-disable-next-line class-methods-use-this
  setEnabled(value) {
    enabled = value;
  }

  /**
   * Enable the proxy
   */
  async enable() {
    // short circuit if no browser.proxy
    if (!browser.proxy) {
      Proxy.debug('unable to enable proxy, browser.proxy not available');
      return this;
    }
    try {
      const {
        adapter,
        util: {
          icon,
          regionlist,
          bypasslist,
          storage,
          settingsmanager,
        },
      } = this.app;
      const region = regionlist.getSelectedRegion();

      if (this.foreground) {
        await adapter.sendMessage(Type.PROXY_ENABLE);
      }
      else {
        Proxy.debug(`connecting to ${region.host}`);
        await browser.proxy.register('js/pac.js');
      }

      this.setEnabled(true);
      if (!this.foreground) {
        await adapter.sendMessage(Type.PROXY_SET_ENABLED, { value: true });
      }
      Proxy.debug('registered PAC script');
      Proxy.debug(`bypass list is ${JSON.stringify(bypasslist.toArray())}`);
      if (!this.foreground) {
        // Send message to PAC script updating proxy information
        await sendMessage(Target.PAC, Type.UPDATE_PAC_INFO, {
          payload: this.PACify(region),
          bypasslist: bypasslist.toArray(),
        });
      }
      icon.online();
      settingsmanager.handleConnect();
      storage.setItem('online', 'true');

      return this;
    }
    catch (err) {
      Proxy.debug('error disabling proxy', err);
      throw err;
    }
  }

  async disable() {
    try {
      // short circuit if no browser.proxy
      if (!browser.proxy) {
        Proxy.debug('unable to disable proxy, browser.proxy not available');
        return this;
      }

      const {
        adapter,
        util: {
          icon,
          settingsmanager,
          storage,
        },
      } = this.app;

      if (this.foreground) {
        await adapter.sendMessage(Type.PROXY_DISABLE);
      }
      else {
        await browser.proxy.unregister();
      }
      this.setEnabled(false);
      if (!this.foreground) {
        await adapter.sendMessage(Type.PROXY_SET_ENABLED, { value: false });
      }
      Proxy.debug('unregistered PAC script');
      icon.offline();
      settingsmanager.handleDisconnect();
      storage.setItem('online', String(false));

      return this;
    }
    catch (err) {
      Proxy.debug('error disabling proxy', err);
      throw err;
    }
  }

  PACify(region) {
    const { settings } = this.app.util;

    return {
      type: 'https',
      host: region.host,
      port: settings.getItem('maceprotection') ? region.macePort : region.port,
    };
  }

  static debug(msg, err) {
    const debugMsg = `proxy.js: ${msg}`;
    debug(debugMsg);
    console.log(debugMsg);
    if (err) {
      const errMsg = `error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`;
      debug(errMsg);
      console.error(errMsg);
    }
    return new Error(debugMsg);
  }
}

export default Proxy;
