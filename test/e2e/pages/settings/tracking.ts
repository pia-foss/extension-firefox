import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class TrackingSection extends SectionBase {
  public disableWebsiteReferrer: Checkbox;
  public disableHyperLinkAuditing: Checkbox;
  public removeUtmParameters: Checkbox;
  public piaMace: Checkbox;
  public fingerprintProtection: Checkbox;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.sectionwrapper.tracking',
        }),
        name: 'tracking settings',
      },
      parent,
    );
    this.disableWebsiteReferrer = new Checkbox(
      {
        selector: createSelector({
          value: '#blockreferer',
        }),
        name: 'disableWebsiteReferrer',
      },
      this,
    );
    this.disableHyperLinkAuditing = new Checkbox(
      {
        selector: createSelector({
          value: '#blockhyperlinkaudit',
        }),
        name: 'disableHyperLinkAuditing',
      },
      this,
    );
    this.removeUtmParameters = new Checkbox(
      {
        selector: createSelector({
          value: '#blockutm',
        }),
        name: 'removeUtmParameters',
      },
      this,
    );
    this.piaMace = new Checkbox(
      {
        selector: createSelector({
          value: '#maceprotection',
        }),
        name: 'piaMace',
      },
      this,
    );
    this.fingerprintProtection = new Checkbox(
      {
        selector: createSelector({
          value: '#fingerprintprotection',
        }),
        name: 'fingerprintProtection',
      },
      this,
    );
  }
}

export { TrackingSection };
