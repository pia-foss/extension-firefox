import ChromeSetting from 'chromesettings/chromesetting';

class WebRTC extends ChromeSetting {
  constructor() {
    super(WebRTC.getSetting());

    // functions
    this.applySetting = this.createApplySetting(
      'disable_non_proxied_udp',
      'webrtc',
      'block',
    );
    this.clearSetting = this.createClearSetting(
      'webrtc',
      'unblock',
    );

    // bindings
    this.onChange = this.onChange.bind(this);

    // init
    this.settingDefault = true;
    this.blockable = Boolean(this.setting);
    this.settingID = 'preventwebrtcleak';
  }

  onChange(details) {
    this.setLevelOfControl(details.levelOfControl);
    this.setBlocked(details.value === 'disable_non_proxied_udp');
  }

  static getSetting() {
    if (
      chrome.privacy
      && chrome.privacy.network
    ) {
      return chrome.privacy.network.webRTCIPHandlingPolicy;
    }
    return undefined;
  }
}

export default WebRTC;
