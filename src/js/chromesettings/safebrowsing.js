import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  let setting;
  if (chrome.privacy && chrome.privacy.services && chrome.privacy.services.safeBrowsingEnabled) {
    setting = chrome.privacy.services.safeBrowsingEnabled;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === false;
  }));

  self.settingDefault = true;
  self.available = Boolean(setting);
  self.settingID = "blocksafebrowsing";

  self.applySetting = () => {
    return self._set({value: false})
    .then(() => {
      debug("safebrowsing.js: block ok");
      return self;
    })
    .catch((error) => {
      debug(`safebrowsing.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._clear()
    .then(() => {
      debug(`safebrowsing.js: unblock ok`);
      return self;
    })
    .catch((error) => {
      debug(`safebrowsing.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
