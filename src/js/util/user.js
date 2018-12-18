import http from 'helpers/http';

const USERNAME_KEY = 'form:username';
const PASSWORD_KEY = 'form:password';
const LOGGED_IN_KEY = 'loggedIn';

class User {
  constructor(app) {
    // bindings
    this.storageBackend = this.storageBackend.bind(this);
    this.setRememberMe = this.setRememberMe.bind(this);
    this.inLocalStorage = this.inLocalStorage.bind(this);
    this.username = this.username.bind(this);
    this.password = this.password.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.getPassword = this.getPassword.bind(this);
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.removeUsernameAndPasswordFromStorage = this
      .removeUsernameAndPasswordFromStorage.bind(this);
    this.auth = this.auth.bind(this);
    this.logout = this.logout.bind(this);
    this.getRememberMe = this.getRememberMe.bind(this);
    this.getLoggedInStorageItem = this.getLoggedInStorageItem.bind(this);
    this.setLoggedInStorageItem = this.setLoggedInStorageItem.bind(this);
    this.removeLoggedInStorageItem = this.removeLoggedInStorageItem.bind(this);

    // init
    this.app = app;
    this.authed = false;
    this.authing = false;
    this.authTimeout = 5000;
  }

  /* ------------------------------------ */
  /*              Getters                 */
  /* ------------------------------------ */

  get storage() { return this.app.util.storage; }

  get settings() { return this.app.util.settings; }

  get icon() { return this.app.util.icon; }

  get adapter() { return this.app.adapter; }

  get proxy() { return this.app.proxy; }

  get loggedIn() {
    const loggedInStorageItem = this.getLoggedInStorageItem();
    const credentialsStored = Boolean(
      this.getUsername().length
      && this.getPassword().length,
    );

    if (loggedInStorageItem && !credentialsStored) {
      debug('user is expecting to be logged in, but no credentials exist');
    }

    return loggedInStorageItem && credentialsStored;
  }

  get logOutOnClose() {
    return this.settings.getItem('logoutOnClose');
  }

  getLoggedInStorageItem() {
    return this.storage.getItem(LOGGED_IN_KEY, this.storageBackend()) === 'true';
  }

  setLoggedInStorageItem (value, bridged) {
    this.storage.setItem(LOGGED_IN_KEY, value, this.storageBackend());
    if (!bridged) {
      this.adapter.sendMessage('util.user.setLoggedInStorageItem', { value });
    }
  }

  removeLoggedInStorageItem (bridged) {
    this.storage.removeItem(LOGGED_IN_KEY, this.storageBackend());
    if (!bridged) {
      this.adapter.sendMessage('util.user.removeLoggedInStorageItem');
    }
  }

  storageBackend() {
    return this.settings.getItem('rememberme') ? 'localStorage' : 'memoryStorage';
  }

  /**
   * Set the value of remember me, and swap credentials over to new storage medium
   *
   * @param {boolean} rememberMe Whether the user should be remembered past the current session
   * @param {boolean} bridged Whether this should trigger changes on the backend
   *
   * @returns {void}
   */
  setRememberMe(rememberMe, bridged) {
    const prevRememberMe = this.getRememberMe();
    if (rememberMe !== prevRememberMe) {
      // Get username and password and remove from previous storage
      const username = this.getUsername();
      const password = this.getPassword();
      const loggedIn = this.getLoggedInStorageItem();

      // Remove from current storage medium
      this.removeUsernameAndPasswordFromStorage(true);
      this.removeLoggedInStorageItem(true);

      // Swap storage
      this.settings.setItem('rememberme', Boolean(rememberMe), true);
      this.setLoggedInStorageItem(loggedIn);

      // Set username and password in new storage
      this.setUsername(username, true);
      this.setPassword(password, true);
      if (!bridged) {
        this.adapter.sendMessage('util.user.setRememberMe', { rememberMe });
      }
    }
  }

  getRememberMe() {
    return this.settings.getItem('rememberme');
  }

  inLocalStorage() {
    return this.storageBackend() === 'localStorage';
  }

  getUsername() {
    const username = this.storage.getItem(USERNAME_KEY, this.storageBackend());
    return typeof username === 'string' ? username.trim() : '';
  }

  getPassword() {
    const password = this.storage.getItem(PASSWORD_KEY, this.storageBackend());
    return password || '';
  }

  password() {
    console.log('user.password() is deprecated, please use user.getPassword() instead');
    if (console.trace) { console.trace(); }
    return this.getPassword();
  }

  username() {
    console.log('user.username() is deprecated, please use user.getUsername() instead');
    if (console.trace) { console.trace(); }
    return this.getUsername();
  }

  setUsername(username, bridged) {
    this.storage.setItem(USERNAME_KEY, username, this.storageBackend());
    if (!bridged) {
      this.adapter.sendMessage('util.user.setUsername', { username });
    }
  }

  setPassword(password, bridged) {
    this.storage.setItem(PASSWORD_KEY, password, this.storageBackend());
    if (!bridged) {
      this.adapter.sendMessage('util.user.setPassword', { password });
    }
  }

  removeUsernameAndPasswordFromStorage(bridged) {
    this.storage.removeItem(USERNAME_KEY, this.storageBackend());
    this.storage.removeItem(PASSWORD_KEY, this.storageBackend());
    if (!bridged) {
      this.adapter.sendMessage('util.user.removeUsernameAndPasswordFromStorage');
    }
  }

  auth() {
    const username = this.getUsername();
    const password = this.getPassword();
    const headers = { Authorization: `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}` };
    debug('user.js: start auth');
    return http.head('https://www.privateinternetaccess.com/api/client/auth', { headers, timeout: this.authTimeout }).then((res) => {
      this.authing = false;
      this.adapter.sendMessage('util.user.authing', false);
      this.authed = true;
      this.setLoggedInStorageItem(true);
      this.adapter.sendMessage('util.user.authed', true);
      this.icon.updateTooltip();
      debug('user.js: auth ok');
      return res;
    }).catch((res) => {
      this.setLoggedInStorageItem(false);
      this.authing = false;
      this.adapter.sendMessage('util.user.authing', false);
      this.authed = false;
      this.adapter.sendMessage('util.user.authed', false);
      debug(`user.js: auth error, ${res.cause}`);
      throw res;
    });
  }

  logout(afterLogout) {
    return this.proxy.disable().then(() => {
      this.authed = false;
      this.adapter.sendMessage('util.user.authed', false);
      if (!this.getRememberMe()) {
        this.removeUsernameAndPasswordFromStorage();
      }
      this.setLoggedInStorageItem(false);
      this.icon.updateTooltip();
      if (afterLogout) {
        afterLogout();
      }
    });
  }
}

export default User;
