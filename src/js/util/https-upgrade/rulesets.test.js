/* eslint import/first: 0, no-use-before-define: 0 */
import path from 'path';

import { extract } from './worker';
import { applyRuleset } from './rulesets';

describe('@util > https-upgrade > rulesets', () => {
  describe('#applyRuleset', () => {
    [
      {
        ruleset: {
          name: 'simple',
          rule: [{
            from: '^http:',
            to: 'https:',
          }],
        },
        url: 'http://neovim.io',
        expected: 'https://neovim.io',
      },
      {
        ruleset: {
          name: 'exclusion',
          rule: [{
            from: '^http:',
            to: 'https:',
          }],
          exclusions: /^http:\/\/(www\.)?neovim\.io/,
        },
        url: 'http://neovim.io',
        expected: undefined,
      },
    ].forEach(({ ruleset, url, expected }) => {
      test(`applying ${ruleset.name} to ${url} should give ${expected}`, async () => {
        const actual = applyRuleset(ruleset, url);
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('#extract', () => {
    let gz;
    let decode;

    beforeEach(() => {
      decode = jest.fn().mockReturnValue(JSON.stringify({ test: 'test' }));
      // eslint-disable-next-line prefer-arrow-callback
      window.TextDecoder = jest.fn().mockImplementation(function constructor() {
        return { decode };
      });
      chrome.runtime.getURL.mockReturnValue(path.resolve(__dirname, 'worker.js'));
      gz = Uint8Array.from(
        atob('H4sICPWlm1wAA3Rlc3QAq1ZQKkktLlGygtIKtVwAsJiS3BMAAAA='),
        (c) => {
          return c.charCodeAt(0);
        },
      );
    });

    test('successfully decompresses gz file', async () => {
      const extracted = await extract(gz);
      const expected = new Uint8Array(
        [
          123, 32, 34, 116, 101, 115,
          116, 34, 58, 32, 34, 116,
          101, 115, 116, 34, 32, 125, 10,
        ],
      );
      expect(decode).toBeCalledWith(expected);
      expect(extracted.test).toEqual('test');
    });
  });
});
