import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  let setting;
  if (chrome.privacy && chrome.privacy.websites && chrome.privacy.websites.thirdPartyCookiesAllowed) {
    setting = chrome.privacy.websites.thirdPartyCookiesAllowed;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === false;
  }));

  self.settingDefault = true;
  self.available = Boolean(setting);
  self.settingID = "blockthirdpartycookies";

  self.applySetting = () => {
    return self._set({value: false})
    .then(() => {
      debug("thirdpartycookies.js: block ok");
      return self;
    })
    .catch((error) => {
      debug(`thirdpartycookies.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._clear({})
    .then(() => {
      debug("thirdpartycookies.js: unblock ok");
      return self;
    })
    .catch((error) => {
      debug(`thirdpartycookies.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
