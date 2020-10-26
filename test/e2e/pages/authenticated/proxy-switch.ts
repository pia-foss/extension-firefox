import { Button } from '../../elements';

class ProxySwitch extends Button {
  waitForConnected() {
    return this.waitForHasClass('connected');
  }

  waitForDisconnected() {
    return this.waitForHasClass('disconnected');
  }
}

export { ProxySwitch };
