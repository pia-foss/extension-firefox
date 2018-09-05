import { Script } from '../core';

interface Payload {}

function failConnection(script: Script): Promise<string> {
  return script.executeAsync<Payload, string>(
    function (_, done) {
      browser.runtime.getBackgroundPage().then(({ app }: any) => {
        const id = app
          .util
          .errorinfo
          .set('net::ERR_CONNECTION_RESET', 'https://www.privateinternetaccess.com/robots.txt');
        done(id);
      });
    },
    {},
  );
}

export { failConnection };
