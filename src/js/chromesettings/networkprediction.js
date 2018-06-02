import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  let setting;
  if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.networkPredictionEnabled) {
    setting = chrome.privacy.network.networkPredictionEnabled;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === false;
  }));

  self.settingDefault = true;
  self.available = Boolean(setting);
  self.settingID = "blocknetworkprediction";

  self.applySetting = () => {
    return self._set({value: false})
    .then(() => {
      debug("networkprediction.js: block ok");
      return self;
    })
    .catch((error) => {
      debug(`networkprediction.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._clear()
    .then(() => {
      debug(`networkprediction.js: unblock ok`);
      return self;
    })
    .catch((error) => {
      debug(`networkprediction.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
