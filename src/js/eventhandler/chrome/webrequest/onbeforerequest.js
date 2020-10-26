/*
  *** WARNING ***
  This event handler is always active. It could be run while a direct connection is being
  used, while another proxy extension is active, or while the Private Internet Access
  extension is active.

  Being unaware of this could introduce serious bugs that compromise the security of the
  extension.

*/
import createApplyListener from '@helpers/applyListener';

function filterQueryParameters(app) {
  const { util: { settings } } = app;
  const filterLists = {
    blockutm: ['utm_source', 'utm_medium', 'utm_term', 'utm_content', 'utm_campaign'],
    blockfbclid: ['fbclid'],
  };

  function containsFilterQueries(url, filterList) {
    return !!filterList.find((param) => {
      return url.searchParams.has(param);
    });
  }

  function createFilteredUrl(url, filterList) {
    const copy = new URL(url);
    filterList.forEach((queryParam) => {
      copy.searchParams.delete(queryParam);
    });

    return copy.toString();
  }

  function getFilterList() {
    return Object.keys(filterLists)
      .filter((key) => { return settings.isActive(key); })
      .map((key) => { return filterLists[key]; })
      .reduce((a, b) => { return [...a, ...b]; });
  }

  return (details) => {
    if (settings.enabled()) {
      const filterList = getFilterList();
      const url = new URL(details.url);
      if (filterList.length && containsFilterQueries(url, filterList)) {
        const redirectUrl = createFilteredUrl(url, filterList);
        if (redirectUrl) {
          debug(`onbeforerequest.js: filtered ${JSON.stringify(filterList)}`);
          return { redirectUrl };
        }
        debug(`onbeforerequest.js: failed to filter ${JSON.stringify(filterList)}`);
      }
    }
    return undefined;
  };
}

export default createApplyListener((app, addListener) => {
  const { util: { httpsUpgrade } } = app;
  addListener(httpsUpgrade.onBeforeRequest, { urls: ['*://*/*', 'ftp://*/*'] }, ['blocking']);
  addListener(filterQueryParameters(app), { urls: ['<all_urls>'] }, ['blocking']);
});
