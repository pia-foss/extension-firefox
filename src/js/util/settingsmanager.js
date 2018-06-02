export default function(app) {
  const apply = (csettings, settings) => {
    for(let name in csettings)
      if(settings.getItem(csettings[name].settingID))
        csettings[name].applySetting()
  }
  const clear = (csettings) => {
    for(let name in csettings)
      if(!csettings[name].alwaysActive)
        csettings[name].clearSetting()
  }

  this.handleConnect = () => {
    const {settings} = app.util,
          {chromesettings} = app
    apply(chromesettings, settings)
  }

  this.handleDisconnect = () => {
    const {chromesettings} = app
    clear(chromesettings)
  }

  return this
}
