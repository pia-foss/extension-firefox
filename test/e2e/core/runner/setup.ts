import 'geckodriver';
import { By } from 'selenium-webdriver';

import { DriverFactory, Driver } from '../driver';
import { Context } from './context';
import { Windows } from '../entities/windows';
import { getExtensionPath } from '../entities/extension';

async function getInternalID(driver: Driver) {
  await driver.get('about:debugging');
  const selector = '.internal-uuid > span';
  const by = By.css(selector);
  const element = await driver.waitAndFindElement(by);
  const internalID = await element.getText();
  await driver.get('about:newtab');

  return internalID;
}

async function getBaseURL(driver: Driver) {
  const internalID = await getInternalID(driver);
  const baseURL = `moz-extension://${internalID}`;

  return baseURL;
}

/* Selenium Hooks */

beforeEach('global setup', async function () {
  const context = (this as any as Context);
  const driver = await DriverFactory.createDriver();
  await (driver as any).installAddon(await getExtensionPath());
  driver.baseURL = await getBaseURL(driver);
  context.windows = new Windows(driver);
  // Wait to allow extension background to load
  await driver.sleep(500);
});

afterEach('global teardown', async function () {
  await DriverFactory.destroyDriver();
});
