function filterAvailable(setting) {
  return setting.isAvailable ? setting.isAvailable() : true;
}

function clear(csettings) {
  Object.values(csettings)
    .filter(filterAvailable)
    .filter((s) => { return !s.alwaysActive; })
    .forEach((s) => { s.clearSetting(); });
}

function apply(csettings, settings) {
  Object.values(csettings)
    .filter(filterAvailable)
    .filter((s) => { return settings.getItem(s.settingID); })
    .forEach((s) => { s.applySetting(); });
}

function reapply(contentsettings) {
  const { app: { util: { settings } } } = this;
  const enabled = settings.enabled();
  Object.values(contentsettings)
    .filter((s) => { return s.isAvailable ? s.isAvailable() : true; })
    .filter((s) => { return s.isApplied(); })
    .filter((s) => { return enabled || s.alwaysActive; })
    .forEach((s) => { s.applySetting(); });
}


class SettingsManager {
  constructor(app) {
    this.app = app;

    this.apply = this.apply.bind(this);
    this.disable = this.disable.bind(this);
    this.clearAndReapplySettings = this.clearAndReapplySettings.bind(this)
    reapply = reapply.bind(this);
  }

  clearAndReapplySettings(setting){
    if(setting == 'alwaysActive'){
      const { app: { util:{settings},proxy }} = this;
      const alwaysActive = settings.getItem('alwaysActive');
      const boolArray = [alwaysActive,proxy.enabled()];
      boolArray.includes(true) ? this.apply() : this.disable();
    }
  }


  apply() {
    const {
      app: {
        util: { settings },
        chromesettings,
      },
    } = this;
    apply(chromesettings, settings);
  }

  disable() {
    const { app: { chromesettings } } = this;
    clear(chromesettings);
  }
}

export default SettingsManager;
