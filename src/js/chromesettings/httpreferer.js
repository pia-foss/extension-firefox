import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  let setting;
  if (chrome.privacy && chrome.privacy.websites && chrome.privacy.websites.referrersEnabled) {
    setting = chrome.privacy.websites.referrersEnabled;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === false;
  }));

  self.settingDefault = true;
  self.settingID = "blockreferer";
  self.referable = Boolean(setting);

  self.applySetting = () => {
    return self._set({value: false})
    .then(() => {
      debug("httpreferer.js: block ok");
      return self;
    })
    .catch((error) => {
      debug(`httpreferer.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._clear({})
    .then(() => {
      debug("httpreferer.js: unblock ok");
      return self;
    })
    .catch((error) => {
      debug(`httpreferer.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
