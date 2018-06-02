import initOnAuthRequired      from 'eventhandler/chrome/webrequest/onauthrequired';
import initOnCompleted         from 'eventhandler/chrome/webrequest/oncompleted';
import initOnErrorOccurred     from 'eventhandler/chrome/webrequest/onerroroccurred';
import initOnBeforeRequest     from 'eventhandler/chrome/webrequest/onbeforerequest';
import initOnMessage           from 'eventhandler/chrome/runtime/onmessage';
import initOnInstalled         from 'eventhandler/chrome/runtime/oninstalled';
import initOnUpdateAvailable   from 'eventhandler/chrome/runtime/onupdateavailable';
import initOnAlarm             from 'eventhandler/chrome/alarms/onalarm';
import initOnError             from 'eventhandler/onerror';

export default function(app) {
  const onAuthRequired    = initOnAuthRequired(app);
  const onCompleted       = initOnCompleted(app);
  const onMessage         = initOnMessage(app);
  const onErrorOccurred   = initOnErrorOccurred(app);
  const onBeforeRequest   = initOnBeforeRequest(app);
  const onInstalled       = initOnInstalled(app);
  const onUpdateAvailable = initOnUpdateAvailable(app);
  const onAlarm           = initOnAlarm(app);
  const onError           = initOnError(app);

  // existence check for FF ESR v52
  if (chrome.webRequest.onAuthRequired) {
    chrome.webRequest.onAuthRequired.addListener(onAuthRequired, {urls: ["<all_urls>"]}, ["blocking"]);
  }
  chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {urls: ["<all_urls>"]}, ["blocking"]);
  chrome.webRequest.onCompleted.addListener(onCompleted, {urls: ["<all_urls>"]});
  chrome.webRequest.onErrorOccurred.addListener(onErrorOccurred, {urls: ["<all_urls>"]});
  chrome.runtime.onMessage.addListener(onMessage);
  chrome.runtime.onInstalled.addListener(onInstalled);
  chrome.runtime.onUpdateAvailable.addListener(onUpdateAvailable);
  chrome.alarms.onAlarm.addListener(onAlarm);
  window.addEventListener('error', onError);

  return this;
}
