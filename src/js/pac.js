let payload;
let bypasslist = [];

browser.runtime.onMessage.addListener((message) => {
  if (message.payload) { payload = message.payload; }
  if (message.bypasslist) { bypasslist = message.bypasslist; }
});

const isValidIPv4 = (host) => {
  return host.split('.').every((octet) => {
    return !isNaN(Number(octet));
  });
}

const getIPv4OctetAsNumber = (ip, octetIndex) => {
  return Number(ip.split('.')[octetIndex]);
}

const matchRule = (str, rule) => {
  // capture group (to replace) [.?+^$[\]\\(){}|-]
  // $& - matched substring
  const reg = "^" + rule.replace(/[.?+^$[\]\\(){}|-]/g, "\\$&").split("*").join(".*") + "$";
  return new RegExp(reg).test(str);
}

const bypassFilter = (url, host) => {
  // handle easy localhost matches
  if (host === 'localhost') { return true; }
  else if (host.endsWith('.local')) { return true; }
  else if (host === '::1') { return true; }
  else if (host === '0000:0000:0000:0000:0000:0000:0000:0001') { return true; }

  // check if host is an IP
  if (isValidIPv4(host)) {
    // if valid ipv4, check for ipv4 localhosts
    if (host.startsWith('0.')) { return true; }
    else if (host.startsWith('10.')) { return true; }
    else if (host.startsWith('127.0.0')) { return true; }
    else if (host.startsWith('169.254.')) { return true; }
    else if (host.startsWith('192.168.')) { return true; }
    else if (host.startsWith('172.')) {
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
  if (bypassFilter(url, host)) { return [{type: 'DIRECT'}]; }
  return [payload];
}
