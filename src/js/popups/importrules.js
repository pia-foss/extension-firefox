import '@babel/polyfill';

import '@style/pia';
import '@style/popups/importrules';
import { sendMessage, Target, Type } from '@helpers/messaging';

(async () => {
  function debug(debugMsg) {
    sendMessage(Target.BACKGROUND, Type.DEBUG, { debugMsg });
  }

  function t(key, opts = {}) {
    return sendMessage(Target.BACKGROUND, Type.I18N_TRANSLATE, { key, opts });
  }

  const Element = {
    input: {
      id: 'import-file-input',
    },
    error: {
      id: 'import-error',
    },
    label: {
      id: 'import-file-label',
      key: 'ImportLabel',
    },
    message: {
      id: 'import-message',
      key: 'ImportFileMessage',
    },
  };

  async function getCurrentTabID() {
    const { id: tabID } = await browser.tabs.getCurrent();

    return tabID;
  }

  async function closeWindow() {
    const tabID = await getCurrentTabID();

    return browser.tabs.remove(tabID);
  }

  /**
   * Set error message
   *
   * **DO NOT CALL WITH ANY USER INPUT**
   *
   * @param {string} msg Error message
   *
   * @returns {Error}
   */
  function setError(msg) {
    debug(`importrules.js: ${msg}`);
    const errElement = document.getElementById(Element.error.id);
    errElement.innerHTML = msg;

    return new Error(`importrules.js: ${msg}`);
  }

  /**
   * Set error for invalid file
   */
  async function setInvalidFileError() {
    return setError(await t('InvalidImportFileStructure'));
  }

  /**
   * Clear the error message
   */
  function clearError() {
    return setError('');
  }

  /**
   * Attempt to parse the JSON file
   *
   * Sets error message if parsing fails
   */
  async function parse(result) {
    let rules = null;
    try {
      rules = JSON.parse(result);
    }
    catch (_) {
      throw await setInvalidFileError();
    }

    const { popularRules, userRules } = rules;
    if (!Array.isArray(popularRules) || !Array.isArray(userRules)) {
      throw await setInvalidFileError();
    }

    const allRules = [...popularRules, ...userRules];
    await Promise.all(
      allRules.map(async (rule) => {
        if (typeof rule !== 'string') {
          throw await setInvalidFileError();
        }
      }),
    );

    await clearError();

    return rules;
  }

  /**
   * Called when the imported file has been read successfully
   *
   * @returns {Promise<void>}
   */
  async function loadEndListener() {
    const { result } = this;
    let rules;
    try {
      rules = await parse(result);
    }
    catch (err) {
      debug('importrules.js: failed to parse rules file, ensure valid JSON');
      return Promise.resolve();
    }
    await sendMessage(Target.BACKGROUND, Type.IMPORT_RULES, { rules });

    return closeWindow();
  }

  /**
   * Listen for file to be uploaded
   *
   * @returns {void}
   */
  function onFileChange() {
    const [file] = this.files;
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('loadend', loadEndListener);
      reader.readAsText(file);
    }
  }

  /**
   * Handle clicking of file input
   *
   * Clear current files and re-register the onfilechange listener
   *
   * @this {HTMLInputElement}
   */
  function onImportClick() {
    this.removeEventListener('change', onFileChange);
    this.value = null;
    this.addEventListener('change', onFileChange);
  }

  async function updateTranslation({ id, key }) {
    document.getElementById(id).innerHTML = await t(key);
  }

  updateTranslation(Element.message);
  updateTranslation(Element.label);

  document.getElementById(Element.input.id).addEventListener('click', onImportClick);
})();
