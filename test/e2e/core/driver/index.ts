import { Driver as FirefoxDriver } from 'selenium-webdriver/firefox';
import { By, WebElementPromise, Builder } from 'selenium-webdriver';

import { augmentDriver } from './augmentDriver';
import { createOptions } from './options'

interface Driver extends FirefoxDriver {
  waitAndFindElement(by: By): WebElementPromise;
  baseURL: string;
}

class DriverFactory {
  private static driver = null as Driver | null;

  private static async createFirefoxDriver(): Promise<FirefoxDriver> {
    const options = await createOptions();
    const thenableDriver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
    const driver = await thenableDriver as FirefoxDriver;

    return driver;
  }

  public static getDriver(): Driver {
    if (!DriverFactory.driver) {
      throw new Error('driver was not created before trying to use it');
    }

    return DriverFactory.driver;
  }

  /**
   * Create the driver
   */
  public static async createDriver(): Promise<Driver> {
    if (DriverFactory.driver) {
      throw new Error('a driver is already active');
    }
    const firefoxDriver = await DriverFactory.createFirefoxDriver();
    DriverFactory.driver = await augmentDriver(firefoxDriver);

    return DriverFactory.driver;
  }

  /**
   * Destroy the current browser instance
   *
   * @async
   */
  public static async destroyDriver(): Promise<void> {
    if (!DriverFactory.driver) {
      throw new Error('no driver exists to destroy');
    }

    await DriverFactory.driver.quit();
    DriverFactory.driver = null;
  }
}

export { DriverFactory, Driver, FirefoxDriver };
