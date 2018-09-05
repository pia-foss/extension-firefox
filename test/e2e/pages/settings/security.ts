import { PageObject } from '../../core';
import { SectionBase } from './sectionBase';
import { Checkbox } from '../../elements';
import { createSelector } from '../../core/entities/selector';

class SecuritySection extends SectionBase {
  public preventWebRtcLeak: Checkbox;
  constructor(parent: PageObject) {
    super(
      {
        selector: createSelector({
          value: '.sectionwrapper.security',
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
  }
}

export { SecuritySection };
