import { Options } from 'selenium-webdriver/firefox';

async function createOptions(): Promise<Options> {
  const options = new Options();
  options.setPreference('marionette', true);

  return options;
}

export { createOptions };
