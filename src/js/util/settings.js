export default function(app) {
  const {storage} = app.util

  this.setDefaults = () => {
    const {chromesettings} = app,
          defaults = {
            "blockutm":              true,
            "maceprotection":        true,
            "debugmode":             false,
            "rememberme":            true
          }
    for(let k in chromesettings) {
      let s = chromesettings[k]
      defaults[s.settingID] = s.settingDefault
    }
    Object.keys(defaults).forEach((key) => {
      if(!this.hasItem(key))
        this.setItem(key, defaults[key])
    })
  }

  this.hasItem = (key) => {
    return storage.hasItem(`settings:${key}`)
  }

  this.getItem = (key) => {
    return storage.getItem(`settings:${key}`) === "true"
  }

  this.setItem = (key, value, bridged) => {
    if(value === true || value === "true") {
      storage.setItem(`settings:${key}`, "true")
      if (!bridged) {
        app.adapter.sendMessage('updateSettings', {key:`${key}`, value: 'true'})
      }
    }
    else{
      storage.setItem(`settings:${key}`, "false")
      if (!bridged) {
        app.adapter.sendMessage('updateSettings', {key:`${key}`, value: 'false'})
      }
    }
  }

  return this
}
