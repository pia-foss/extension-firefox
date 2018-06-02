export default function(app) {
  const greenRobots = {
          16:  "/images/icons/icon16.png",
          32:  "/images/icons/icon32.png",
          48:  "/images/icons/icon48.png",
          64:  "/images/icons/icon64.png",
          128: "/images/icons/icon128.png"
        },
        redRobots = {
          16:  "/images/icons/icon16red.png",
          32:  "/images/icons/icon32red.png",
          48:  "/images/icons/icon48red.png",
          64:  "/images/icons/icon64red.png",
          128:  "/images/icons/icon128red.png"
        }

  this.online = () => {
    if (chrome.browserAction.setIcon) {
      chrome.browserAction.setIcon({path: greenRobots})
    }
    debug("icon.js: set icon online")
    this.updateTooltip()
  }

  this.offline = () => {
    if (chrome.browserAction.setIcon) {
      chrome.browserAction.setIcon({path: redRobots})
    }
    debug("icon.js: set icon offline")
    this.updateTooltip()
  }

  this.updateTooltip = () => {
    const {proxy} = app,
          {regionlist, user} = app.util
    let title
    if(proxy.enabled())
      title = t("YouAreConnectedTo", {region: regionlist.getSelectedRegion().localizedName()})
    else
      title = user.authed ? t("YouAreNotConnected") : "Private Internet Access"
    chrome.browserAction.setTitle({title})
    debug(`icon.js: tooltip updated`)
  }

  return this
}
