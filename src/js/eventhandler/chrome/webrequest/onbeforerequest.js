/*

  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import 'url';

export default function onBeforeRequest(app) {
  const utmParamNames = ['utm_source', 'utm_medium', 'utm_term', 'utm_content', 'utm_campaign'];
  const hasUTMQuery = (url) => {
    return utmParamNames.find((name) => { return url.searchParams.has(name); });
  };
  const newURLWithoutUTMQuery = (url) => {
    utmParamNames.forEach((name) => { return url.searchParams.delete(name); });
    return url.toString();
  };

  return (details) => {
    const { proxy } = app;
    const { settings } = app.util;
    if (!proxy.enabled()) {
      return undefined;
    }
    if (settings.getItem('blockutm')) {
      const url = new URL(details.url);
      const redirectUrl = hasUTMQuery(url) ? newURLWithoutUTMQuery(url) : undefined;
      if (redirectUrl) {
        debug('blockutm. remove UTM query string.');
      }
      return redirectUrl ? { redirectUrl } : undefined;
    }

    return undefined;
  };
}
