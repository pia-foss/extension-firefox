export default class MockAppAdapter {
  constructor (app) {
    // bindings
    this.setAuth = this.setAuth.bind(this);
    this.initialize = this.initialize.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);

    // handle listener
    browser.runtime.onMessage.addListener(this.handleMessage);
  }

  handleMessage (message, sender, response) {
    if (!message) { return; }
    if (message.target !== 'background') { return; }

    // can't return a promise because it's the polyfill version
    // and firefox won't recognize it as a "real" promise
    new Promise((resolve, reject) => {
      if (message.type === 'initialize') {
        return resolve(this.initialize());
      }
      else if (message.type === 'proxy.enabled') {
        app.proxy.setEnabled(message.data);
        return resolve({});
      }
      else if (message.type === 'proxy.enable') {
        return resolve(app.proxy.enable().then(() => { return {}; }));
      }
      else if (message.type === 'proxy.disable') {
        return resolve(app.proxy.disable().then(() => { return {}; }));
      }
      else if (message.type === 'util.user.authed') {
        app.util.user.authed = message.data;
        return resolve({});
      }
      else if (message.type === 'util.user.authing') {
        app.util.user.authing = message.data;
        return resolve({});
      }
      else if (message.type === 'util.regionlist.region') {
        app.util.regionlist.setSelectedRegion(message.data, true);
        return resolve({});
      }
      else if (message.type === 'updateSettings') {
        app.util.settings.setItem(message.data.key, message.data.value, true);
        return resolve({});
      }
      else if (message.type === 'enablePopularRule') {
        app.util.bypasslist.enablePopularRule(message.data, true);
        return resolve({});
      }
      else if (message.type === 'disablePopularRule') {
        app.util.bypasslist.disablePopularRule(message.data, true);
        return resolve({});
      }
      else if (message.type === 'setUserRules') {
        app.util.bypasslist.setUserRules(message.data, true);
        return resolve({});
      }
      else if (message.type === 'setFavoriteRegion') {
        app.util.regionlist.setFavoriteRegion(message.data, true);
        return resolve({});
      }
      else if (message.type === 'initAuthTransfer') {
        this.setAuth();
        return resolve({});
      }
      else { return resolve({}); }
    })
    .then(response) // eslint-disable-line dot-location
    .catch((err) => { return response(false); }); // eslint-disable-line

    // must return true here to keep the response callback alive
    return true;
  }

  initialize () {
    let payload = {
      proxy: {enabled: app.proxy.enabled()},
      online: app.util.storage.getItem('online'),
      util: {
        user: {
          authed: app.util.user.authed,
          authing: app.util.user.authing,
          username: app.util.user.username(),
          password: app.util.user.password()
        },
        regionlist: {
          region: {id: app.util.regionlist.getSelectedRegion().id},
          favorites: app.util.storage.getItem('favoriteregions')
        },
        bypasslist: {
          user: app.util.bypasslist.getUserRules(),
          popular: app.util.bypasslist.enabledPopularRules().join(",")
        },
        settings: {}
      }
    };

    // set settings values
    for(let key in app.chromesettings) {
      let id = app.chromesettings[key].settingID
      payload.util.settings[id] = app.util.settings.getItem(id);
    }
    payload.util.settings.blockutm = app.util.settings.getItem('blockutm');
    payload.util.settings.maceprotection = app.util.settings.getItem('maceprotection');
    payload.util.settings.debugmode = app.util.settings.getItem('debugmode');
    payload.util.settings.rememberme = app.util.settings.getItem('rememberme');

    return payload;
  }

  setAuth() {
    this.sendMessage('requestAuthTransfer')
    .then((user) => { // eslint-disable-line dot-location
      if (!user.username || !user.password) { return; }
      app.util.storage.setItem('form:username', user.username, app.util.user.storageBackend())
      app.util.storage.setItem('form:password', user.password, app.util.user.storageBackend())
    });
  }

  sendMessage (type, data) {
    return browser.runtime.sendMessage({target: 'foreground', type, data})
    .catch((err) => { // eslint-disable-line dot-location
      const errMessage = 'Could not establish connection';
      if (err.message.startsWith(errMessage)) { return; } // eslint-disable-line no-useless-return
      else { throw err; }
    });
  }
}
