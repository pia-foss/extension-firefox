export default class MockAppAdapter {
  constructor(app) {
    // properties
    this.app = app;

    // bindings
    this.initialize = this.initialize.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);

    // handle listener
    browser.runtime.onMessage.addListener(this.handleMessage);
  }

  handleMessage(message, sender, response) {
    if (!message) { return; }
    if (message.target !== 'background') { return; }

    // can't return a promise because it's the polyfill version
    // and firefox won't recognize it as a "real" promise
    new Promise((resolve) => {
      let res = {};

      if (message.type === 'initialize') {
        res = this.initialize();
      }
      else if (message.type === 'proxy.enabled') {
        this.app.proxy.setEnabled(message.data);
      }
      else if (message.type === 'proxy.enable') {
        res = this.app.proxy.enable().then(() => { return {}; });
      }
      else if (message.type === 'proxy.disable') {
        res = this.app.proxy.disable().then(() => { return {}; });
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
      else if (message.type === 'util.regionlist.region') {
        this.app.util.regionlist.setSelectedRegion(message.data, true);
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
      else if (message.type === 'setFavoriteRegion') {
        this.app.util.regionlist.setFavoriteRegion(message.data, true);
      }

      return resolve(res);
    })
      .then(response) // eslint-disable-line dot-location
      .catch((err) => { return response(false); }); // eslint-disable-line

    // must return true here to keep the response callback alive
    return true;
  }

  initialize() {
    const payload = {
      proxy: { enabled: this.app.proxy.enabled() },
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
    return browser.runtime.sendMessage({ target: 'foreground', type, data })
    .catch((err) => { // eslint-disable-line dot-location
      const errMessage = 'Could not establish connection';
      if (err.message.startsWith(errMessage)) { return; } // eslint-disable-line no-useless-return
      else { throw err; }
    });
  }
}
