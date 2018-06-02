export default function(app) {
  const isNewVersion = (newVersionStr, oldVersionStr) => {
          const oldVersion = parseInt(oldVersionStr.replace(/\./g, "")),
                newVersion = parseInt(newVersionStr.replace(/\./g, ""))
          return newVersion > oldVersion
        }

  const onUpdate = async (details) => {
    await app.util.i18n.worker()
    const type = 'basic',
          title = t("ExtensionUpdated"),
          message = t("WelcomeToNewVersion", {appVersion: `v${app.buildinfo.version}`}),
          iconUrl = chrome.extension.getURL("images/icons/icon64.png")
    if(isNewVersion(app.buildinfo.version, details.previousVersion))
      chrome.notifications.create("UpdateMessage", {type, title, iconUrl, message})
  }

  return (details) => {
    switch(details.reason) {
    case "update":
      onUpdate(details)
      break
    }
  }
}
