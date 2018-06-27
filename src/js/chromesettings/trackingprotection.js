import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  let setting;
  if (chrome.privacy && chrome.privacy.websites && chrome.privacy.websites.trackingProtectionMode) {
    setting = chrome.privacy.websites.trackingProtectionMode;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === "always";
  }));

  self.settingDefault = true;
  self.available = Boolean(setting);
  self.settingID = "trackingprotection";

  self.applySetting = () => {
    return self._set({value: "always"})
    .then(() => {
      debug("trackingprotection.js: block ok");
      return self;
    })
    .catch((error) => {
      debug(`trackingprotection.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._set({value: false}, {applyValue: true})
    .then(() => {
      debug(`trackingprotection.js: unblock ok`);
      return self;
    })
    .catch((error) => {
      debug(`trackingprotection.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
