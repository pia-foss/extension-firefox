import ChromeSetting from './chromesetting';

export default function () {
  let setting;
  if (chrome.privacy && chrome.privacy.websites && chrome.privacy.websites.resistFingerprinting) {
    setting = chrome.privacy.websites.resistFingerprinting;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === false;
  }));

  self.settingDefault = false;
  self.available = Boolean(setting);
  self.settingID = 'fingerprintprotection';

  self.applySetting = () => {
    return self._set({ value: true })
      .then(() => {
        debug('fingerprintprotection.js: block ok');
        return self;
      })
      .catch((error) => {
        debug(`fingerprintprotection.js: block failed (${error})`);
        return self;
      });
  };

  self.clearSetting = () => {
    return self._set({ value: false }, { applyValue: true })
      .then(() => {
        debug('fingerprintprotection.js: unblock ok');
        return self;
      })
      .catch((error) => {
        debug(`fingerprintprotection.js: unblock failed (${error})`);
        return self;
      });
  };

  return self;
}
