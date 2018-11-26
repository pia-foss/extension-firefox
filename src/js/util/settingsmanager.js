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

export default function (app) {
  this.handleConnect = () => {
    const { settings } = app.util;
    const { chromesettings } = app;
    apply(chromesettings, settings);
  };

  this.handleDisconnect = () => {
    const { chromesettings } = app;
    clear(chromesettings);
  };

  return this;
}
