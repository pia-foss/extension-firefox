/*
  Utilities for sending/receiving messages within the PIA application

  @type Listener <T> = (payload: T) => void;
*/

const Target = {
  ALL: '@all',
  POPUPS: '@popups',
  FOREGROUND: '@foreground',
  BACKGROUND: '@background',
  PAC: '@pac',
};

const Namespace = {
  REGIONLIST: 'util.regionlist',
  PROXY: 'proxy',
};

const Type = {
  FOREGROUND_OPEN: 'foreground_open',
  UPDATE_PAC_INFO: 'update_pac_info',
  SET_SELECTED_REGION: `${Namespace.REGIONLIST}.setSelectedRegion`,
  IMPORT_REGIONS: `${Namespace.REGIONLIST}.import`,
  SET_FAVORITE_REGION: `${Namespace.REGIONLIST}.setFavoriteRegion`,
  PROXY_ENABLE: `${Namespace.PROXY}.enable`,
  PROXY_DISABLE: `${Namespace.PROXY}.disable`,
  PAC_UPDATE: `${Target.PAC}/update`,
};

async function sendMessage(target, type, data) {
  if (!Object.values(Target).includes(target)) {
    throw new Error(`invalid target: ${target}`);
  }
  if (!type) {
    throw new Error('invalid type');
  }
  const msg = {
    type,
    target,
    data: data || {},
  };
  const opts = {
    toProxyScript: target === Target.PAC || target === Target.ALL,
  };

  return browser.runtime.sendMessage(msg, opts);
}

function isTarget(message, target) {
  if (!message) { return false; }
  if (!message.target) { return false; }
  if (message.target !== target && message.target !== Target.ALL) { return false; }

  return true;
}

function isType(message, type) {
  if (!message) { return false; }
  if (!message.type) { return false; }
  if (!message.type === type) { return false; }

  return true;
}

export {
  Target,
  Type,
  Namespace,
  sendMessage,
  isTarget,
  isType,
};
