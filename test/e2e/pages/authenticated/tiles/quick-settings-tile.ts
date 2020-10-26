import { createSelector, ElementDescriptor, Node } from '../../../core';
import { Button } from '../../../elements';
import { Tile } from './tile';
import { QuickSettingButton } from './quick-setting-button';

type SettingName
  = 'mace'
  | 'http-referrer'
  | 'debug-log'
  | 'fingerprint'
  | 'theme';

class QuickSettingsTile extends Tile {
  public mace: QuickSettingButton;
  public httpReferrer: QuickSettingButton;
  public debugLog: QuickSettingButton;
  public theme: QuickSettingButton;
  public fingerprint: QuickSettingButton;
  public viewAll: Button;

  public constructor(descriptor: ElementDescriptor, parent?: Node) {
    super(descriptor, parent);
    this.mace = new QuickSettingButton(
      {
        selector: QuickSettingsTile.createSettingSelector('maceprotection'),
        name: 'mace quicksetting',
      },
      this,
    );
    this.httpReferrer = new QuickSettingButton(
      {
        selector: QuickSettingsTile.createSettingSelector('blockreferer'),
        name: 'http referrrer quicksetting',
      },
      this,
    );
    this.debugLog = new QuickSettingButton(
      {
        selector: QuickSettingsTile.createSettingSelector('debugmode'),
        name: 'debug log quicksetting',
      },
      this,
    );
    this.fingerprint = new QuickSettingButton(
      {
        selector: QuickSettingsTile.createSettingSelector('fingerprintprotection'),
        name: 'dark theme quicksetting',
      },
      this,
    );
    this.theme = new QuickSettingButton(
      {
        selector: QuickSettingsTile.createSettingSelector('darkTheme'),
        name: 'dark theme quicksetting',
      },
      this,
    );
    this.viewAll = new QuickSettingButton(
      {
        selector: QuickSettingsTile.createSettingSelector('viewAll'),
        name: 'view all quicksetting',
      },
      this,
    );
  }

  getSettingButton(name: SettingName) {
    switch (name) {
      case 'mace': return this.mace;
      case 'http-referrer': return this.httpReferrer;
      case 'debug-log': return this.debugLog;
      case 'fingerprint': return this.fingerprint;
      case 'theme': return this.theme;
      default: throw new Error(`invalid setting name: ${name}`);
    }
  }

  getStorageKey(name: SettingName) {
    switch (name) {
      case 'mace': return 'settings:maceprotection';
      case 'http-referrer': return 'settings:blockreferer';
      case 'debug-log': return 'settings:debugmode';
      case 'fingerprint': return 'settings:fingerprintprotection';
      case 'theme': return 'settings:darkTheme';
      default: throw new Error(`no storage key for ${name}`);
    }
  }

  async isActive(): Promise<boolean> {
    return this.hasClass('active');
  }

  async toggle() {
    const el = await this.element;
    await el.click();
  }

  async enable() {
    const active = await this.isActive();
    if (!active) {
      await this.toggle();
    }
  }

  async disable() {
    const active = await this.isActive();
    if (active) {
      await this.toggle();
    }
  }

  public static createSettingSelector(id: string) {
    return createSelector({
      value: `.quick-settings-option[data-option-id=${id}]`,
    });
  }
}

export { QuickSettingsTile, SettingName };
