import { expect } from 'chai';

import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { BrowserUpgradePage } from '../pages/upgrade';
import { blockWebRTC } from '../scripts/blockWebRTC';
import { translate } from '../scripts/translate';
import { FingerprintPage } from '../pages/fingerprint';

idescribe('the upgrade browser page', function () {
  let loginPage: LoginPage;
  let upgradePage: BrowserUpgradePage;
  let fingerprintPage: FingerprintPage;

  ibeforeEach(async function () {
    loginPage = new LoginPage();
    upgradePage = new BrowserUpgradePage();
    fingerprintPage = new FingerprintPage();

    await loginPage.navigate();
    await fingerprintPage.optIn();
    await blockWebRTC(this.script);
    await this.windows.refresh({ waitForVisible: upgradePage.warningIcon });
  });

  iit('is shown when WebRTC API missing', async function () {
    const expectedText = await translate(
      this.script,
      'UpgradeBrowserMessage',
      { browser: 'Firefox' },
    );
    await upgradePage.warningIcon.expect.visible;
    await upgradePage.warningText.expect.visible;
    const actualText = await upgradePage.warningText.getText();
    expect(actualText).to.eq(expectedText);
  });
});
