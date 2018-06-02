import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  let setting;
  if (chrome.privacy && chrome.privacy.websites && chrome.privacy.websites.hyperlinkAuditingEnabled) {
    setting = chrome.privacy.websites.hyperlinkAuditingEnabled;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === false;
  }));

  self.settingDefault = true;
  self.available = Boolean(setting);
  self.settingID = "blockhyperlinkaudit";

  self.applySetting = () => {
    return self._set({value: false})
    .then(() => {
      debug("hyperlinkaudit.js: block ok");
      return self;
    })
    .catch((error) => {
      debug(`hyperlinkaudit.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._clear({})
    .then(() => {
      debug("hyperlinkaudit.js: unblock ok");
      return self;
    })
    .catch((error) => {
      debug(`hyperlinkaudit.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
