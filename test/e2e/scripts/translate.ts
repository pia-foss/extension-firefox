import { Script } from '../core';

interface TranslateOpts {
  browser?: 'Firefox';
}

interface Payload {
  key: string;
  opts: TranslateOpts;
}

function translate(script: Script, key: string, opts: TranslateOpts = {}) {
  return script.executeAsync<Payload, string>(
    function ({ key, opts }, done) {
      browser.runtime.getBackgroundPage().then(({ app }: any) => {
        const { t } = app.util.i18n;

        done(t(key, opts));
      });
    },
    { key, opts },
  );
}

export { translate };
