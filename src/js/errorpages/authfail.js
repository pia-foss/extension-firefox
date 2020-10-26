import { t } from '@errorpages/utils';
import '@style/errorpage.scss';

((_, document) => {
  document.addEventListener('DOMContentLoaded', async () => {
    const pageTitle = document.querySelector('head title');
    const errorTitle = document.querySelector('h1#title');
    const errorMessage = document.querySelector('h4#message');
    pageTitle.innerHTML = await t('AuthFailPageTitle');
    errorTitle.innerHTML = await t('AuthFailTitle');
    errorMessage.innerHTML = await t('AuthFailMessage');
  });

  return this;
})(window, document);
