import tinyhttp from "tinyhttp";

/*
TODO: All calls to change username/password should use user util
TODO: setUsername and setPassword must propagate changes to backend
TODO: All calls to change rememberme should be done via user util
TODO: All calls to retrieve password/username should use user util
TODO: Handle messages to adapter
FIXME: Broke logging out
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
        icon: this._icon,
      },
      adapter: this._adapter,
      proxy: this._proxy,
    } = app);
    this._http = tinyhttp('https://www.privateinternetaccess.com');
    this.authed = false;
    this.authing = false;
    this.authTimeout = 5000;
  }

  storageBackend() {
    return this._settings.getItem('rememberme') ? 'localStorage' : 'memoryStorage';
  }

  setRememberMe(rememberMe, bridged) {
    this._settings.setItem('rememberme', Boolean(rememberMe), bridged);
  }

  inLocalStorage() {
    return this.storageBackend() === 'localStorage';
  }

  username() {
    const username = this._storage.getItem('form:username', this.storageBackend());
    return typeof username === 'string' ? username.trim() : '';
  }

  password() {
    const password = this._storage.getItem('form:password', this.storageBackend());
    return password || '';
  }

  setUsername(username, bridged) {
    this._storage.setItem('form:username', username, this.storageBackend());
    if (!bridged) {
      this._adapter.sendMessage('user.setUsername', {username});
    }
  }

  setPassword(password, bridged) {
    this._storage.setItem('form:password', password, this.storageBackend());
    if (!bridged) {
      this._adapter.sendMessage('user.setPassword', {password});
    }
  }

  removeUsernameAndPasswordFromStorage(bridged) {
    this._storage.removeItem('form:username', this.storageBackend());
    this._storage.removeItem('form:password', this.storageBackend());
    if (!bridged) {
      this._adapter.sendMessage('user.removeUsernameAndPasswordFromStorage');
    }
  }

  inStorage() {
    return this.username().length > 0 && this.password().length > 0;
  }

  auth() {
    const username = this.username(),
          password = this.password(),
          headers  = {'Authorization': `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`};
    debug('user.js: start auth');
    return http.head("/api/client/auth", {headers, timeout: this.authTimeout}).then((xhr) => {
      this.authing = false;
      this._adapter.sendMessage('util.user.authing', false);
      this.authed = true;
      this._adapter.sendMessage('util.user.authed', true);
      this._icon.updateTooltip();
      this._adapter.sendMessage('initAuthTransfer');
      debug("user.js: auth ok");
      return xhr;
    }).catch((xhr) => {
      this.authing = false;
      this._adapter.sendMessage('util.user.authing', false);
      this.authed = false;
      this._adapter.sendMessage('util.user.authed', false);
      debug(`user.js: auth error, ${xhr.tinyhttp.cause}`);
      throw xhr;
    });
  }

  logout(afterLogout) {
    return this._proxy.disable().then(() => {
      this.authed = false;
      this._adapter.sendMessage('util.user.authed', false);
      this.removeUsernameAndPasswordFromStorage();
      this._icon.updateTooltip();
      if (afterLogout) {
        afterLogout();
      }
      return;
    });
  }
}

export default User;
