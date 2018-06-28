import tinyhttp from "tinyhttp";

/*
TODO: All calls to change username/password should use user util
TODO: setUsername and setPassword must propagate changes to backend
TODO: All calls to change rememberme should be done via user util
TODO: All calls to retrieve password/username should use user util
*/

export default function(app) {
  const self = this,
        {storage, settings} = app.util,
        http = tinyhttp("https://www.privateinternetaccess.com");

  self.authed  = false;
  self.authing = false;
  self.authTimeout = 5000;

  self.storageBackend = () => {
    return settings.getItem('rememberme') ? 'localStorage' : 'memoryStorage';
  };

  self.setRememberMe = (rememberMe, bridged) => {
    settings.setItem('rememberme', Boolean(rememberMe), bridged);
  };

  self.inLocalStorage = () => {
    return self.storageBackend() === 'localStorage';
  };

  self.username = () => {
    const username = storage.getItem('form:username', self.storageBackend());
    return typeof username === 'string' ? username.trim() : '';
  };

  self.password = () => {
    const password = storage.getItem('form:password', self.storageBackend());
    return password || '';
  };

  self.setUsername = (username, bridged) => {
    storage.setItem('form:username', username, self.storageBackend());
    if (!bridged) {
      app.adapter.sendMessage('user.setUsername', {username});
    }
  };

  self.setPassword = (password, bridged) => {
    storage.setItem('form:password', password, self.storageBackend());
    if (!bridged) {
      app.adapter.sendMessage('user.setPassword', {password});
    }
  };

  self.removeUsernameAndPasswordFromStorage = (bridged) => {
    storage.removeItem('form:username', self.storageBackend());
    storage.removeItem('form:password', self.storageBackend());
    if (!bridged) {
      app.adapter.sendMessage('user.removeUsernameAndPasswordFromStorage');
    }
  };

  self.inStorage = () => {
    return self.username().length > 0 && self.password().length > 0;
  };

  self.auth = () => {
    const username = self.username(),
          password = self.password(),
          {icon}   = app.util,
          headers  = {'Authorization': `Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`};
    debug('user.js: start auth');
    return http.head("/api/client/auth", {headers, timeout: self.authTimeout}).then((xhr) => {
      self.authing = false;
      app.adapter.sendMessage('util.user.authing', false);
      self.authed = true;
      app.adapter.sendMessage('util.user.authed', true);
      icon.updateTooltip();
      app.adapter.sendMessage('initAuthTransfer');
      debug("user.js: auth ok");
      return xhr;
    }).catch((xhr) => {
      self.authing = false;
      app.adapter.sendMessage('util.user.authing', false);
      self.authed = false;
      app.adapter.sendMessage('util.user.authed', false);
      debug(`user.js: auth error, ${xhr.tinyhttp.cause}`);
      throw(xhr);
    });
  };

  self.logout = (afterLogout) => { /* FIXME: remove callback for promise chaining. */
    const {proxy} = app,
          {icon} = app.util;
    return proxy.disable().then(() => {
      self.authed = false;
      app.adapter.sendMessage('util.user.authed', false);
      self.removeUsernameAndPasswordFromStorage();
      icon.updateTooltip();
      return void (afterLogout && afterLogout());
    });
  };

  return self;
}
