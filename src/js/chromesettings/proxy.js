import ChromeSetting from './chromesetting';
import { sendMessage, Type, Target } from '../helpers/messaging';
import http from '../helpers/http';

const ONLINE_KEY = 'online';
const MACE_KEY = 'maceprotection';

class Proxy extends ChromeSetting {
  constructor(app, foreground) {
    super(browser.proxy.settings);

    // bindings
    this.onChange = this.onChange.bind(this);
    this.settingsInMemory = this.settingsInMemory.bind(this);
    this.getEnabled = this.getEnabled.bind(this);
    this.enabled = this.enabled.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.clear = this.clear.bind(this);

    // init
    this.app = app;
    this.foreground = foreground;
    // Assign a settingID for debugging purposes
    this.settingID = 'proxy';
    this.areSettingsInMemory = false;
    // This is not blocked despite not having a setting
    this.setBlocked(false);
  }

  onChange(details) {
    const {
      util: {
        storage,
        icon,
        settingsmanager,
      },
    } = this.app;

    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(false);

    if (this.enabled()) {
      settingsmanager.handleConnect();
      icon.online();
      storage.setItem(ONLINE_KEY, String(true));
    }
    else {
      settingsmanager.handleDisconnect();
      icon.offline();
      storage.setItem(ONLINE_KEY, String(false));
    }

    this.areSettingsInMemory = true;
  }

  settingsInMemory() {
    return this.areSettingsInMemory;
  }

  getEnabled() {
    return this.getLevelOfControl() === ChromeSetting.controlled;
  }

  enabled() {
    return this.getEnabled();
  }

  async enable() {
    const {
      util: {
        regionlist,
        settings,
        bypasslist,
      },
      adapter,
    } = this.app;
    if (this.foreground) {
      await adapter.sendMessage(Type.PROXY_ENABLE);
    }
    else {
      const region = regionlist.getSelectedRegion();
      const port = settings.getItem(MACE_KEY) ? region.macePort : region.port;
      const pacMessage = Proxy.createPacMessage(region, port, bypasslist.toArray());
      await browser.proxy.register('js/pac.js');
      await sendMessage(Target.PAC, Type.PAC_UPDATE, pacMessage);
      await this.set({ value: { proxyType: 'manual' } });
      // Immediately make request to force handshake with proxy
      // server to occur on background script. Browsers can block
      // `webrequest` API on certain domains, so this is necessary
      // to ensure `onauthrequired` can always perform handshake
      http.head('https://privateinternetaccess.com');
    }
    if (this.setting && !this.setting.onChange) {
      await this.get();
    }
    Proxy.debug('enabled');

    return this;
  }

  async disable() {
    if (this.foreground) {
      await this.app.adapter.sendMessage(Type.PROXY_DISABLE);
    }
    else {
      await browser.proxy.unregister();
      await this.clear();
    }
    if (this.setting && !this.setting.onChange) {
      await this.get();
    }
    Proxy.debug('disabled');

    return this;
  }

  /**
   * Must override set as it uses Promise API for proxy
   */
  async set(options, override) {
    if (this.isControllable()) {
      await this.setting.set(Object.assign({}, ChromeSetting.defaultSetOptions, options));
      if (browser.runtime.lastError !== null) { throw browser.runtime.lastError; }
      if (override && override.applyValue) { this.applied = options.value; }
      else { this.applied = true; }
    }
    else {
      throw new Error(`${this.settingID}: extension cannot control this setting`);
    }
  }

  /**
   * Must override get as it uses Promise API for proxy
   */
  async get() {
    if (this.isAvailable()) {
      const details = await this.setting.get(ChromeSetting.defaultGetOptions);
      await Promise.resolve(this.onChange(details));
      if (chrome.runtime.lastError !== null) { throw chrome.runtime.lastError; }
    }
    else {
      throw new Error(`${this.settingID} setting is not available`);
    }
  }

  static createPacMessage(region, port, bypassList) {
    if (!Array.isArray(bypassList)) {
      throw new Error('expected bypassList to be array');
    }
    return {
      payload: {
        type: region.scheme,
        host: region.host,
        port,
      },
      bypassList,
    };
  }

  static debug(msg, err) {
    return ChromeSetting.debug('proxy', msg, err);
  }
}

export default Proxy;
