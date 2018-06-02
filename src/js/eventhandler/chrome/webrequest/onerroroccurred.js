/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.
*/
export default function(app) {
  const networkErrors = [
    "NS_ERROR_UNKNOWN_PROXY_HOST",
    "NS_ERROR_PROXY_CONNECTION_REFUSED",
    "NS_ERROR_CONNECTION_REFUSED",
    "NS_ERROR_NET_TIMEOUT",
    "NS_ERROR_OFFLINE",
    "NS_ERROR_ABORT"
  ];

  return (details) => {
    const connectedToPIA    = app.proxy.enabled();
    const errorOnMainFrame  = details.type === "main_frame";
    const catchableError    = networkErrors.indexOf(details.error) > -1;

    if(!connectedToPIA || !errorOnMainFrame || !catchableError) { return; }

    // get the tab from the details object
    browser.tabs.get(details.tabId)
    // update tab with error page
    .then(() => {
      let url;
      if (details.url && !details.url.startsWith('moz-extension')) {
        url = encodeURIComponent(details.url);
      }

      const msg = details.error;
      const errorPageURL = chrome.extension.getURL(`html/errorpages/connfail.html?msg=${msg}&url=${url}`);
      chrome.tabs.update(details.tabId, {url: errorPageURL});
    })
    .catch(() => {});

    debug(`connection error: ${details.error}`);
    return {cancel: true};
  }
}
