import { idescribe, iit, ibeforeEach } from '../core';
import { translate } from '../scripts/translate';
import { AuthFailPage } from '../pages/authfail';
import { cleanHtml } from '../scripts/cleanHtml';
import { expect } from 'chai';

idescribe('the page shown on authentication failure', function () {
  let authfailPage: AuthFailPage;

  ibeforeEach(async function () {
    // Init
    authfailPage = new AuthFailPage();

    // Nav
    await authfailPage.navigate();
  });

  iit('contains a title and message is visible', async function () {
    // Arrange
    const dirtyExpectedMessage = await translate(this.script, 'AuthFailMessage');
    const dirtyActualMessage = await authfailPage.message.getText();
    const expectedPageTitle = await translate(this.script, 'AuthFailPageTitle');
    const expectedTitle = await translate(this.script, 'AuthFailTitle');

    // Act
    const expectedMessage = await cleanHtml(this.script, dirtyExpectedMessage);
    const actualMessage = (await cleanHtml(this.script, dirtyActualMessage)).replace('\n\n', '');
    const actualPageTitle = await authfailPage.title.getText();

    // Assert
    expect(actualMessage).to.eq(expectedMessage);
    expect(expectedPageTitle).to.contain(actualPageTitle);
    await this.windows.expectCurrentTitleContains(expectedTitle);
  });

  iit('contains a "support team" button that opens help desk', async function () {
    await authfailPage.support.click();
    await this.windows.expectCurrentUrlIs('https://www.privateinternetaccess.com/helpdesk/');
  });
});
