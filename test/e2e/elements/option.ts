import { Node, createSelector } from '../core';

class Option extends Node {
  private readonly id: string;

  constructor(id: string, parent: Node) {
    super(
      {
        selector: createSelector({
          value: `#${id}`,
        }),
        name: id,
      },
      parent,
    );
    this.id = id;
  }

  async isActive(): Promise<boolean> {
    const className = await this.getAttribute('class');
    return className.includes('active');
  }

  getId() {
    return this.id;
  }

  async click() {
    const el = await this.getElement();
    await el.click();
  }
}

export { Option };
