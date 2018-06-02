/*
   This object wraps a ChromeSetting: https://developer.chrome.com/extensions/types#type-ChromeSetting
   Similar to but not the same as a ContentSetting.
*/
export default function(chromeSetting, blockedPredicate) {
  // return empty object if browser setting doesn't exist
  if (!chromeSetting) { return {}; }

  let levelOfControl;
  let controllable;
  let blocked;
  let applied;

  const self = Object.create(null);
  const defaultSetOptions   = {scope: "regular"};
  const defaultGetOptions   = {};
  const defaultClearOptions = {scope: "regular"};
  const onChange = (details) => {
    levelOfControl = details.levelOfControl;
    controllable = levelOfControl === "controllable_by_this_extension" || levelOfControl === "controlled_by_this_extension";
    blocked = blockedPredicate(details);
  }


  self.getLevelOfControl = () => levelOfControl;
  self.isControllable = () => levelOfControl === undefined || controllable;
  self.isBlocked = () => blocked;
  self.isApplied = () => applied;

  self._set = (options) => {
    return new Promise((resolve, reject) => {
      if(self.isControllable()) {
        chromeSetting.set(Object.assign({}, defaultSetOptions, options), () => {
          if(chrome.runtime.lastError === null) {
            applied = true;
            resolve();
          }
          else { reject(chrome.runtime.lastError); }
        });
      }
      else { reject("extension cannot control this setting"); }
    });
  }

  self._get = () => {
    return new Promise((resolve, reject) => {
      chromeSetting.get(defaultGetOptions, (details) => {
        onChange(details);
        chrome.runtime.lastError === null ? resolve(details) : reject(chrome.runtime.lastError);
      });
    });
  }

  self._clear = (options) => {
    return new Promise((resolve, reject) => {
      if(self.isControllable()) {
        chromeSetting.clear(Object.assign({}, defaultClearOptions, options || {}), () => {
          if(chrome.runtime.lastError === null) {
            applied = false;
            resolve();
          }
          else { reject(chrome.runtime.lastError); }
        });
      }
      else { reject("extension cannot control this setting"); }
    })
  }

  chromeSetting.get({}, onChange);

  /*
    This API is currently missing on Firefox but documented as existing:
    https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/types/BrowserSetting/onChange
  */
  if(chromeSetting.onChange) { chromeSetting.onChange.addListener(onChange); }

  return self;
}
