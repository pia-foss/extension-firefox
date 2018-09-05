import { Script } from '../core';

interface Payload {}

function getFrozen(script: Script) {
  return script.executeAsync<Payload, boolean>(
    ({}, done) => {
      browser.runtime.getBackgroundPage().then((window: any) => {
        const { app } = window;

        done(Boolean(app.frozen));
      });
    },
    {},
  );
}

export { getFrozen };
