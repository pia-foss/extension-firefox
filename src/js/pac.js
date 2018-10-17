let payload;
let bypasslist = [];

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Cannot import messaging utils as this file cannot be 'browserified'
  if (!message) { return; }
  if (message.target !== '@pac') { return; }
  if (message.type !== 'update_pac_info') { return; }
  if (typeof message.data !== 'object') { return; }
  if (message.data === null) { return; }

  const { data } = message;
  if (data.payload) { ({ payload } = data); }
  if (data.bypasslist) { ({ bypasslist } = data); }
  sendResponse({});
});

function isValidIPv4(host) {
  return host.split('.').every((octet) => {
    return !Number.isNaN(Number(octet));
  });
}

function getIPv4OctetAsNumber(ip, octetIndex) {
  return Number(ip.split('.')[octetIndex]);
}

function matchRule(str, rule) {
  // capture group (to replace) [.?+^$[\]\\(){}|-]
  // $& - matched substring
  const reg = '^' + rule.replace(/[.?+^$[\]\\(){}|-]/g, '\\$&').split('*').join('.*') + '$';
  return new RegExp(reg).test(str);
}

function bypassFilter(url, host) {
  // handle easy localhost matches
  if (host === 'localhost') { return true; }
  if (host.endsWith('.local')) { return true; }
  if (host === '::1') { return true; }
  if (host === '0000:0000:0000:0000:0000:0000:0000:0001') { return true; }

  // check if host is an IP
  if (isValidIPv4(host)) {
    // if valid ipv4, check for ipv4 localhosts
    if (host.startsWith('0.')) { return true; }
    if (host.startsWith('10.')) { return true; }
    if (host.startsWith('127.0.0')) { return true; }
    if (host.startsWith('169.254.')) { return true; }
    if (host.startsWith('192.168.')) { return true; }
    if (host.startsWith('172.')) {
      const octet = getIPv4OctetAsNumber(host, 1);
      if (octet >= 16 && octet <= 31) { return true; }
    }
  }

  // handle bypasslist
  return bypasslist.some((rule) => {
    let matchee = host;
    if (rule.startsWith('http')) { matchee = url; }
    return matchRule(matchee, rule);
  });
}

function FindProxyForURL(url, host) {
  if (bypassFilter(url, host)) { return [{ type: 'DIRECT' }]; }
  return [payload];
}
