
import http from '@helpers/http';
import reportError from '@helpers/reportError';
import timer from '@helpers/timer';

class IpManager {
  constructor(app) {
     // bindings
     this.getRealIP = this.getRealIP.bind(this);
     this.getProxyIP = this.getProxyIP.bind(this);
     this.getIPs = this.getIPs.bind(this);
     this.updateIpByRegion = this.updateIpByRegion.bind(this);
     this.updateByCountry = this.updateByCountry.bind(this);
     // init
     this.app = app;
     this.realIP = null;
     this.proxyIP = null;
  }
  
  getRealIP() {
    return this.realIP;
  }

  getProxyIP() {
    return this.proxyIP;
  }

  getIPs() {
    return {
      realIP: this.getRealIP(),
      proxyIP: this.getProxyIP(),
    };
  }

  updateIpByRegion() {
    this.update();
  }

  updateByCountry(country){
    if(country){
      this.proxyIP = country.ping;
      this.app.util.icon.online(country);
    }
  }

  async update(
    {
      retry = false,
    } = {},
  ) {
      
    debug('ipmanager: updating ip address');
    let attempt = 0;
    const maxAttempts = retry ? 10 : 0;
    const attemptUpdate = async () => {
      const date = new Date().getTime();
      const url = `https://www.privateinternetaccess.com/api/client/services/https/status?${date}`;
      const res = await http.get(url);
      const info = await res.json();
      const { ip } = info;
      let { connected } = info;
      connected = (String(connected) === 'true');
      if (connected) {
        this.proxyIP = ip;
      }
      else {
        this.realIP = ip;
        this.proxyIP = null;
      }
    };
    while (attempt <= maxAttempts) {
      await timer((attempt ** 2) * 1000);
      try {
        await attemptUpdate();
        break;
      }
      catch (err) {
        reportError('ipmanager', err);
      }
      attempt += 1;
    }
  }
}


export default IpManager;