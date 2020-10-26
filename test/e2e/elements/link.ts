import { Node } from '../core';

class Link extends Node {
  public async click() {
    const el = await this.element;

    return el.click();
  }
}

export { Link };
