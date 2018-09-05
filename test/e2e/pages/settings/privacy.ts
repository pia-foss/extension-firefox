import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class PrivacySection extends SectionBase {
  public disableNetworkPrediction: Checkbox;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.sectionwrapper.privacy',
        }),
        name: 'privacy settings',
      },
      parent,
    );
    this.disableNetworkPrediction = new Checkbox(
      {
        selector: createSelector({
          value: '#blocknetworkprediction',
        }),
        name: 'disableNetworkPrediction',
      },
      this,
    );
  }
}

export { PrivacySection };
