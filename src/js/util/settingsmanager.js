export default function (app) {
  const apply = (csettings, settings) => {
    Object.keys(csettings).forEach((name) => {
      if (settings.getItem(csettings[name].settingID)) {
        csettings[name].applySetting();
      }
    });
  };

  const clear = (csettings) => {
    Object.keys(csettings).forEach((name) => {
      if (!csettings[name].alwaysActive) {
        csettings[name].clearSetting();
      }
    });
  };

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
