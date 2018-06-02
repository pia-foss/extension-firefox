import {t} from "errorpages/utils";
import URLParser  from 'url';
import escapeHTML from 'escape-html';

(new function(window, document) {
  const queryStr = URLParser.parse(document.location.href, true).query;
  const safeURI  = (uri) => { return escapeHTML(uri); };

  document.addEventListener('DOMContentLoaded', async () => {
    const pageTitle    = document.querySelector("head title");
    const errorTitle   = document.querySelector("h1#title");
    const errorMessage = document.querySelector("h4#message");

    pageTitle.innerHTML    = await t("ConnectionFailPageTitle");
    errorTitle.innerHTML   = await t("ConnectionFailTitle");
    errorMessage.innerHTML = await t("ConnectionFailMessage");

    const tryAgainBtn      = document.querySelector("a#try-again");
    const errorNameSpan    = document.querySelector("span#error");
    const url = decodeURIComponent(queryStr.url);

    tryAgainBtn.setAttribute("href", safeURI(url));
    tryAgainBtn.innerHTML = await t("TryAgain");
    tryAgainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location = url;
    });

    const msg = safeURI(queryStr.msg);
    errorNameSpan.innerHTML = msg;

    // reconnect to website when online
    // Doesn't work on windows yet
    let onlineListener = (event) => {
      window.location = url;
      window.document.body.removeEventListener('online', onlineListener);
    };
    window.document.body.addEventListener('online', onlineListener);
  });

  return this;
}(window, document))
