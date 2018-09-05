import { Script } from '../core';

interface Payload {}

interface ReturnType {}

function getEnabledPopularRules(script: Script) {
  return script.executeAsync<Payload, ReturnType>(
    ({}, done) => {
      browser.runtime.getBackgroundPage().then((window: any) => {
        const { app } = window;
        const popularRules = app.util.bypasslist.enabledPopularRules();

        done(popularRules);
      });
    },
    {},
  );
}

export { getEnabledPopularRules };
