import { getConfig } from '../util/config';
import { Driver, FirefoxDriver } from '.';
import { By, until } from 'selenium-webdriver';

function augmentDriver(firefoxDriver: FirefoxDriver): Driver {
  const { WAIT_TIME } = getConfig();
  const driver: Driver = Object.assign(Object.create(firefoxDriver), {
    waitAndFindElement(by: By) {
      return firefoxDriver.wait(until.elementLocated(by), WAIT_TIME);
    },
  });

  return driver;
}

export { augmentDriver };
