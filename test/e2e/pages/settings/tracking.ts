import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox, Text } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class TrackingSection extends SectionBase {
  public disableWebsiteReferrer: Checkbox;
  public disableHyperLinkAuditing: Checkbox;
  public removeUtmParameters: Checkbox;
  public removeFbclidParameters: Checkbox;
  public piaMace: Checkbox;
  public fingerprintProtection: Checkbox;
  public hyperLinkAuditMessage: Text;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.section-wrapper.tracking',
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
    this.removeFbclidParameters = new Checkbox(
      {
        selector: createSelector({
          value: '#blockfbclid',
        }),
        name: 'removeFbclidParameters',
      },
      this,
    );
    this.hyperLinkAuditMessage = new Text(
      {
        selector: createSelector({
          value: '.blockhyperlinkaudit-item .error-line',
        }),
        name: 'hyperlink message',
      },
      this,
    );
  }
}

export { TrackingSection };
