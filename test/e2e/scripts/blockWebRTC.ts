import { Script } from '../core';

interface Payload {}

function blockWebRTC(script: Script) {
  return script.executeAsync<Payload, void>(
    ({}, done) => {
      browser.runtime.getBackgroundPage().then((window: any) => {
        const { app } = window;
        app.chromesettings.webrtc.blockable = false;

        done(void 0);
      });
    },
    {},
  );
}

export { blockWebRTC };
