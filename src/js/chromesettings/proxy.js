import ChromeSetting from './chromesetting';
import { sendMessage, Type, Target } from '../helpers/messaging';
import http from '../helpers/http';

const ONLINE_KEY = 'online';
const MACE_KEY = 'maceprotection';

class Proxy extends ChromeSetting {
  constructor(app, foreground) {
    super();

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
    this.init = this.init.bind(this);

    // init
    this.app = app;
    this.foreground = foreground;
    // Assign a settingID for debugging purposes
    this.settingID = 'proxy';
    this.areSettingsInMemory = false;
    // This is not blocked despite not having a setting
    this.setBlocked(false);
  }

  async init() {
    await this.get({ levelOfControl: this.levelOfControl || ChromeSetting.controllable });
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
      await this.set(pacMessage);
      // Immediately make request to force handshake with proxy
      // server to occur on background script. Browsers can block
      // `webrequest` API on certain domains, so this is necessary
      // to ensure `onauthrequired` can always perform handshake
      http.head('https://privateinternetaccess.com');
    }
    await this.get({ levelOfControl: ChromeSetting.controlled });
    Proxy.debug('enabled');

    return this;
  }

  async disable() {
    if (this.foreground) {
      await this.app.adapter.sendMessage(Type.PROXY_DISABLE);
    }
    else {
      await this.clear();
    }
    await this.get({ levelOfControl: ChromeSetting.controllable });
    Proxy.debug('disabled');

    return this;
  }

  async set(value) {
    await browser.proxy.register('js/pac.js');
    await sendMessage(Target.PAC, Type.PAC_UPDATE, value);
    this.applied = true;
  }

  async clear() {
    await browser.proxy.unregister();
    this.applied = false;
  }

  async get(overload = {}) {
    const details = Object.assign(
      { levelOfControl: this.levelOfControl },
      overload,
    );
    await Promise.resolve(this.onChange(details));
    return details;
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
