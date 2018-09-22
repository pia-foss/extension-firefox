import { Options } from 'selenium-webdriver/firefox';

async function createOptions(): Promise<Options> {
  const options = new Options();
  options.setPreference('marionette', true);
  if (String(process.env.HEADLESS) === 'true') {
    options.addArguments('--headless');
  }

  return options;
}

export { createOptions };
