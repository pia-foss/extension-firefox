import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class SecuritySection extends SectionBase {
  public preventWebRtcLeak: Checkbox;
  public httpsUpgrade: Checkbox;

  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.section-wrapper.security',
        }),
        name: 'security settings',
      },
      parent,
    );
    this.preventWebRtcLeak = new Checkbox(
      {
        selector: createSelector({
          value: '#preventwebrtcleak',
        }),
        name: 'preventWebRtcLeak',
      },
      this,
    );
    this.httpsUpgrade = new Checkbox(
      {
        selector: createSelector({
          value: '#httpsUpgrade',
        }),
        name: 'https upgrade',
      },
      this,
    );
  }
}

export { SecuritySection };
