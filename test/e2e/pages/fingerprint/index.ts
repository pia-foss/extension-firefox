import { PageObject } from '../../core';
import { createSelector } from '../../core/entities/selector';
import { Button } from '../../elements';

class FingerprintPage extends PageObject {
  public enableButton: Button;
  public disableButton: Button;

  constructor() {
    super({
      selector: createSelector({
        value: '.fingerprint-opt-in',
      }),
      name: 'fingerprint page',
    });
    this.enableButton = new Button({
      selector: createSelector({
        value: '.fingerprint-options-buttons > .enable',
      }),
      name: 'enable',
    });
    this.disableButton = new Button({
      selector: createSelector({
        value: '.fingerprint-options-buttons > .disable',
      }),
      name: 'disable',
    });
  }

  public optIn() {
    return this.enableButton.click();
  }
}

export { FingerprintPage };
