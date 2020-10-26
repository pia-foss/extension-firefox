import pako from 'pako';

import { MessageType } from '@data/https-upgrade';

// eslint-disable-next-line import/prefer-default-export
export async function extract(rulesBuffer) {
  const compressed = Array.from(new Uint8Array(rulesBuffer))
    .map((b) => { return String.fromCharCode(b); })
    .join('');
  const uncompressed = pako.inflate(compressed);
  const decoded = new TextDecoder('utf-8').decode(uncompressed);
  return JSON.parse(decoded);
}

// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (e) => {
  const { data: { type, payload } } = e;
  switch (type) {
    case MessageType.EXTRACT_REQ: {
      const { rulesBuffer, reqID } = payload;
      const extracted = await extract(rulesBuffer);
      postMessage({
        type: MessageType.EXTRACT_RES,
        payload: {
          extracted,
          reqID,
        },
      });
      return;
    }
    default: {
      throw new Error(`https-upgrade: worker invalid type ${type}`);
    }
  }
});
