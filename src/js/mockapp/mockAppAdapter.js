import {
  Type,
  Target,
  isTarget,
  sendMessage,
  Namespace,
} from 'helpers/messaging';

export default class MockAppAdapter {
  constructor(app) {
    // properties
    this.app = app;
    this.target = Target.FOREGROUND;

    // bindings
    this.initialize = this.initialize.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleRegionList = this.handleRegionList.bind(this);

    // handle listener
    browser.runtime.onMessage.addListener(this.handleMessage);
  }

  handleMessage(message, sender, response) {
    if (!isTarget(message, Target.BACKGROUND)) { return false; }

    // can't return a promise because it's the polyfill version
    // and firefox won't recognize it as a "real" promise
    new Promise((resolve) => {
      let res = {};

      if (message.type === 'initialize') {
        res = this.initialize();
      }
      else if (message.type === 'util.user.authed') {
        this.app.util.user.authed = message.data;
      }
      else if (message.type === 'util.user.authing') {
        this.app.util.user.authing = message.data;
      }
      else if (message.type === 'util.user.setUsername') {
        const { username } = message.data;
        this.app.util.user.setUsername(username, true);
      }
      else if (message.type === 'util.user.setPassword') {
        const { password } = message.data;
        this.app.util.user.setPassword(password, true);
      }
      else if (message.type === 'util.user.setRememberMe') {
        const { rememberMe } = message.data;
        this.app.util.user.setRememberMe(rememberMe, true);
      }
      else if (message.type === 'util.user.removeUsernameAndPasswordFromStorage') {
        this.app.util.user.removeUsernameAndPasswordFromStorage(true);
      }
      else if (message.type === 'util.user.setLoggedInStorageItem') {
        const { value } = message.data;
        this.app.util.user.setLoggedInStorageItem(value, true);
      }
      else if (message.type === 'util.user.removeLoggedInStorageItem') {
        this.app.util.user.removeLoggedInStorageItem(true);
      }
      else if (message.type === 'updateSettings') {
        const { settingID, value } = message.data;
        this.app.util.settings.setItem(settingID, value, true);
      }
      else if (message.type === 'util.settings.toggle') {
        const { settingID } = message.data;
        this.app.util.settings.toggle(settingID, true);
      }
      else if (message.type === 'enablePopularRule') {
        if (message.data.restartProxy === false) {
          this.app.util.bypasslist.enablePopularRule(message.data.name, true, false);
        }
        else {
          this.app.util.bypasslist.enablePopularRule(message.data.name, true);
        }
      }
      else if (message.type === 'disablePopularRule') {
        if (message.data.restartProxy === false) {
          this.app.util.bypasslist.disablePopularRule(message.data.name, true, false);
        }
        else {
          this.app.util.bypasslist.disablePopularRule(message.data.name, true);
        }
      }
      else if (message.type === 'setUserRules') {
        this.app.util.bypasslist.setUserRules(message.data, true);
      }
      else if (message.type.startsWith(Namespace.REGIONLIST)) {
        res = this.handleRegionList(message);
      }
      else if (message.type.startsWith(Namespace.PROXY)) {
        res = this.handleProxyMessage(message);
      }
      else if (message.type.startsWith(Namespace.BYPASSLIST)) {
        res = this.handleBypasslistMessage(message);
      }

      return resolve(res);
    })
      .then(response)
      .catch(() => { return response(false); });

    // must return true here to keep the response callback alive
    return true;
  }

  /**
   * Handle messages directed to regionlist
   */
  handleRegionList(message) {
    return Promise.resolve(message)
      .then(({ data, type }) => {
        const { regionlist } = this.app.util;

        switch (type) {
          case Type.SET_SELECTED_REGION: {
            const { id } = data;
            return regionlist.setSelectedRegion(id, true);
          }
          case Type.IMPORT_REGIONS: {
            return regionlist.import(data);
          }
          case Type.SET_FAVORITE_REGION: {
            return regionlist.setFavoriteRegion(data, true);
          }

          default: throw new Error(`no handler for ${type}`);
        }
      });
  }

  handleProxyMessage(message) {
    return Promise.resolve(message)
      .then(async ({ type }) => {
        const { proxy } = this.app;

        switch (type) {
          case Type.PROXY_ENABLE: {
            await proxy.enable();
            return;
          }

          case Type.PROXY_DISABLE: {
            await proxy.disable();
            return;
          }

          default: throw new Error(`no handler for type '${type}'`);
        }
      });
  }


  handleBypasslistMessage(message) {
    return Promise.resolve(message)
      .then(async ({ type }) => {
        const { util: { bypasslist } } = this.app;

        switch (type) {
          case Type.DOWNLOAD_BYPASS_JSON: {
            await bypasslist.saveRulesToFile();
            return;
          }

          default: throw new Error(`no handler for type: ${type}`);
        }
      });
  }

  initialize() {
    const payload = {
      proxy: { levelOfControl: this.app.proxy.getLevelOfControl() },
      online: this.app.util.storage.getItem('online'),
      util: {
        user: {
          authed: this.app.util.user.authed,
          authing: this.app.util.user.authing,
          loggedIn: this.app.util.user.loggedIn,
          username: this.app.util.user.getUsername(),
          password: this.app.util.user.getPassword(),
        },
        regionlist: {
          region: { id: this.app.util.regionlist.getSelectedRegion().id },
          regions: this.app.util.regionlist.export(),
          favorites: this.app.util.storage.getItem('favoriteregions'),
        },
        bypasslist: {
          user: this.app.util.bypasslist.getUserRules(),
          popular: this.app.util.bypasslist.enabledPopularRules().join(','),
        },
        settings: this.app.util.settings.getAll(),
      },
    };

    return payload;
  }

  sendMessage(type, data) {
    return sendMessage(this.target, type, data)
      .catch((err) => {
        if (!err.message) { throw err; }
        if (err.message.startsWith('Could not establish connection')) { return; }
        throw err;
      });
  }
}
