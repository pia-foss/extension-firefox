/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function openErrorPage(app) {
  const networkErrors = [
    'NS_ERROR_UNKNOWN_PROXY_HOST',
    'NS_ERROR_PROXY_CONNECTION_REFUSED',
    'NS_ERROR_CONNECTION_REFUSED',
    'NS_ERROR_NET_TIMEOUT',
    'NS_ERROR_OFFLINE',
    'NS_ERROR_ABORT',
  ];

  return (details) => {
    const connectedToPIA = app.proxy.enabled();
    const errorOnMainFrame = details.type === 'main_frame';
    const catchableError = networkErrors.indexOf(details.error) > -1;

    if (!connectedToPIA || !errorOnMainFrame || !catchableError) {
      return { cancel: false };
    }

    const { error, tabId } = details;
    const { url } = details;

    (async () => {
      try {
        await browser.tabs.get(tabId);
        const errorID = app.util.errorinfo.set(error, url);
        const connfailUrl = chrome.extension.getURL(`html/errorpages/connfail.html?id=${errorID}`);
        chrome.tabs.update(details.tabId, { url: connfailUrl });
        debug(`connection error: successfully navigated to ${connfailUrl}`);
      }
      catch (err) {
        debug(`connection error: failed to create error for ${url}`);
      }
    })();

    debug(`connection error: ${details.error}`);
    return { cancel: true };
  };
}

export default createApplyListener((app, addListener) => {
  addListener(openErrorPage(app), { urls: ['<all_urls>'] });
});
