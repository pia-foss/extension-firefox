import tinyhttp from "tinyhttp";

/*
TODO: All calls to change username/password should use user util
TODO: setUsername and setPassword must propagate changes to backend
TODO: All calls to change rememberme should be done via user util
TODO: All calls to retrieve password/username should use user util
TODO: Handle messages to adapter
TODO: Fix references to app
*/

class User {
  constructor (app) {
    // bindings
    this.storageBackend = this.storageBackend.bind(this);
    this.setRememberMe = this.setRememberMe.bind(this);
    this.inLocalStorage = this.inLocalStorage.bind(this);
    this.username = this.username.bind(this);
    this.password = this.password.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.removeUsernameAndPasswordFromStorage = this.removeUsernameAndPasswordFromStorage.bind(this);
    this.inStorage = this.inStorage.bind(this);
    this.auth = this.auth.bind(this);
    this.logout = this.logout.bind(this);

    // init
    ({
      util: {
        storage: this._storage,
        settings: this._settings,
      }
    } = app);
    this._http = tinyhttp('https://www.privateinternetaccess.com');
    this.authed = false;
    this.authing = false;
    this.authTimeout = 5000;
  }

  storageBackend() {
    return settings.getItem('rememberme') ? 'localStorage' : 'memoryStorage';
  }

  setRememberMe(rememberMe, bridged) {
    settings.setItem('rememberme', Boolean(rememberMe), bridged);
  }

  inLocalStorage() {
    return this.storageBackend() === 'localStorage';
  }

  username() {
    const username = storage.getItem('form:username', this.storageBackend());
    return typeof username === 'string' ? username.trim() : '';
  }

  password() {
    const password = storage.getItem('form:password', this.storageBackend());
    return password || '';
  }

  setUsername(username, bridged) {
    storage.setItem('form:username', username, this.storageBackend());
    if (!bridged) {
      app.adapter.sendMessage('user.setUsername', {username});
    }
  }

  setPassword(password, bridged) {
    storage.setItem('form:password', password, this.storageBackend());
    if (!bridged) {
      app.adapter.sendMessage('user.setPassword', {password});
    }
  }

  removeUsernameAndPasswordFromStorage(bridged) {
    storage.removeItem('form:username', this.storageBackend());
    storage.removeItem('form:password', this.storageBackend());
    if (!bridged) {
      app.adapter.sendMessage('user.removeUsernameAndPasswordFromStorage');
    }
  }

  inStorage() {
    return this.username().length > 0 && this.password().length > 0;
  }

  auth() {
    const username = this.username(),
          password = this.password(),
          {icon}   = app.util,
          headers  = {'Authorization': `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`};
    debug('user.js: start auth');
    return http.head("/api/client/auth", {headers, timeout: this.authTimeout}).then((xhr) => {
      this.authing = false;
      app.adapter.sendMessage('util.user.authing', false);
      this.authed = true;
      app.adapter.sendMessage('util.user.authed', true);
      icon.updateTooltip();
      app.adapter.sendMessage('initAuthTransfer');
      debug("user.js: auth ok");
      return xhr;
    }).catch((xhr) => {
      this.authing = false;
      app.adapter.sendMessage('util.user.authing', false);
      this.authed = false;
      app.adapter.sendMessage('util.user.authed', false);
      debug(`user.js: auth error, ${xhr.tinyhttp.cause}`);
      throw(xhr);
    });
  }

  logout(afterLogout) {
    const {
      proxy,
      util: {icon}
    } = app;

    return proxy.disable().then(() => {
      this.authed = false;
      app.adapter.sendMessage('util.user.authed', false);
      this.removeUsernameAndPasswordFromStorage();
      icon.updateTooltip();
      if (afterLogout) {
        afterLogout();
      }
      return;
    });
  }
}

export default User;
