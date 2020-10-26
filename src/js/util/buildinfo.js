function getFormattedBrowser() {
  const browser = process.env.BROWSER_NAME;
  const [firstChar] = browser;
  const tail = browser.slice(1);
  return firstChar.toLocaleUpperCase() + tail;
}

export default function buildinfo() {
  const self = Object.assign(Object.create(null), {
    name: process.env.BUILD_NAME,
    version: process.env.PIA_VERSION,
    date: new Date(process.env.BUILD_DATE),
    debug: process.env.NODE_ENV !== 'production',
    coupon: process.env.COUPON,
    gitcommit: process.env.COMMIT_HASH,
    gitbranch: process.env.GIT_BRANCH,
    browser: getFormattedBrowser(),
  });

  return Object.freeze(self);
}
