import ChromeSetting from "chromesettings/chromesetting";

export default function(app) {
  let setting;
  if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
    setting = chrome.privacy.network.webRTCIPHandlingPolicy;
  }

  const self = Object.create(ChromeSetting(setting, (details) => {
    return details.value === "disable_non_proxied_udp";
  }));

  self.settingDefault = true;
  self.blockable = Boolean(setting);
  self.settingID = "preventwebrtcleak";

  self.applySetting = () => {
    return self._set({value: "disable_non_proxied_udp"})
    .then(() => {
      debug("webrtc.js: block ok");
      return self;
    })
    .catch((error) => {
      debug(`webrtc.js: block failed (${error})`);
      return self;
    });
  }

  self.clearSetting = () => {
    return self._clear()
    .then(() => {
      debug(`webrtc.js: unblock ok`);
      return self;
    })
    .catch((error) => {
      debug(`webrtc.js: unblock failed (${error})`);
      return self;
    });
  }

  return self;
}
