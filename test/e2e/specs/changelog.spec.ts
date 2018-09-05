import { idescribe, iit, ibeforeEach } from '../core';
import { LoginPage } from '../pages/login';
import { SettingsPage } from '../pages/settings';
import { AuthenticatedPage } from '../pages/authenticated';
import { ChangelogPage } from '../pages/changelog';
import { FingerprintPage } from '../pages/fingerprint';

idescribe('the changelog page', function () {
  let loginPage: LoginPage;
  let settingsPage: SettingsPage;
  let authPage: AuthenticatedPage;
  let changelogPage: ChangelogPage;
  let fingerprintPage: FingerprintPage;

  ibeforeEach(async function () {
    loginPage = new LoginPage();
    settingsPage = new SettingsPage();
    authPage = new AuthenticatedPage();
    changelogPage = new ChangelogPage();
    fingerprintPage = new FingerprintPage();

    await loginPage.navigate();
    await fingerprintPage.optIn();
    await loginPage.signIn();
    await authPage.menu.settings.click();
    await settingsPage.changelogLink.click();
  });

  iit('can be navigated to by clicking changelog button', async function () {
    await changelogPage.expect.visible;
  });
});
