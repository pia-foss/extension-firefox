import 'babel-polyfill';

browser.runtime.getBackgroundPage().then(async ({ app }) => {
  const {
    util: {
      bypasslist,
      i18n: { t },
    },
    logger: { debug },
  } = app;

  async function getCurrentWindowID() {
    const { id: windowID } = await browser.windows.getCurrent();

    return windowID;
  }

  async function closeWindow() {
    const windowID = await getCurrentWindowID();

    return browser.windows.remove(windowID);
  }

  async function updateSize() {
    const { width, height, id } = await browser.windows.getCurrent();
    return browser.windows.update(id, {
      width: width + 2,
      height: height + 2,
    });
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
    const [errElement] = document.getElementsByClassName('import-error');
    errElement.innerHTML = msg;

    return new Error(`importrules.js: ${msg}`);
  }

  function setInvalidFileError() {
    setError(t('InvalidImportFileStructure'));
  }

  function clearError() {
    setError('');
  }

  function parse(result) {
    let rules = null;
    try {
      rules = JSON.parse(result);
    }
    catch (_) {
      throw setInvalidFileError();
    }

    const { popularRules, userRules } = rules;
    if (!Array.isArray(popularRules) || !Array.isArray(userRules)) {
      throw setInvalidFileError();
    }

    const allRules = [...popularRules, ...userRules];
    allRules.forEach((rule) => {
      if (typeof rule !== 'string') {
        throw setInvalidFileError();
      }
    });

    clearError();

    return rules;
  }

  /**
   * Called when the imported file has been read successfully
   *
   * @returns {Promise<void>}
   */
  function loadEndListener() {
    const { result } = this;
    let rules;
    try {
      rules = parse(result);
    }
    catch (err) {
      debug('importrules.js: failed to parse rules file, ensure valid JSON');
      return Promise.resolve();
    }
    bypasslist.importRules(rules);

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

  document.getElementById('import-file-label').innerHTML = t('ImportLabel');
  document.getElementById('import-file-input').addEventListener('change', onFileChange);
  // TODO: Remove when https://bugzilla.mozilla.org/show_bug.cgi?id=1425829 has been resolved
  await updateSize();
});
