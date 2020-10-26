import applyOnAuthRequired from '@eventhandler/chrome/webrequest/onAuthRequired';
import applyWebRequestOnCompleted from '@eventhandler/chrome/webrequest/onCompleted';
import applyOnWebRequestError from '@eventhandler/chrome/webrequest/onErrorOccurred';
import applyOnBeforeRedirect from '@eventhandler/chrome/webrequest/onBeforeRedirect';
import applyOnBeforeRequest from '@eventhandler/chrome/webrequest/onBeforeRequest';

import applyOnMessage from '@eventhandler/chrome/runtime/onMessage';
import applyOnInstalled from '@eventhandler/chrome/runtime/onInstalled';
import applyOnUpdateAvailable from '@eventhandler/chrome/runtime/onUpdateAvailable';

import applyOnChanged from '@eventhandler/chrome/cookies/onChanged';

import applyOnAlarm from '@eventhandler/chrome/alarms/onAlarm';

import applyOnError from '@eventhandler/onError';

export default function (app) {
  const self = {};

  // WebRequest
  // existence check for FF ESR v52
  if (chrome.webRequest.onAuthRequired) {
    applyOnAuthRequired(app, chrome.webRequest.onAuthRequired);
  }
  applyOnBeforeRedirect(app, chrome.webRequest.onBeforeRedirect);
  applyOnBeforeRequest(app, chrome.webRequest.onBeforeRequest);
  applyWebRequestOnCompleted(app, chrome.webRequest.onCompleted);
  applyOnWebRequestError(app, chrome.webRequest.onErrorOccurred);

  // Runtime
  applyOnInstalled(app, chrome.runtime.onInstalled);
  applyOnMessage(app, chrome.runtime.onMessage);
  applyOnUpdateAvailable(app, chrome.runtime.onUpdateAvailable);

  // Cookies
  applyOnChanged(app, chrome.cookies.onChanged);

  // Alarms
  applyOnAlarm(app, chrome.alarms.onAlarm);

  // Window
  applyOnError(app, {
    addListener(listener) {
      window.addEventListener('error', listener);
    },
  });

  return self;
}
