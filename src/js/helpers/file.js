/**
 * Utility for working with File Blobs
 */
class File {
  /**
   * Constructor
   *
   * @param {string} fileType Type of file
   * @param {any[]} fileParts Parts to include in file blob
   */
  constructor(fileType, fileParts) {
    // Bindings
    this.download = this.download.bind(this);
    this.downloadViaApi = this.downloadViaApi.bind(this);
    this.onChangedListener = this.onChangedListener.bind(this);

    // Init
    this.url = '';
    this.blobId = undefined;
    this.filenameRequiredError = 'File: Filename is required';
    this.apiUnavailableError = 'File: Extension Download API Unavailable';
    this.NoDownloadableFileError = 'File: Could Not Create Downloadable Object';
    this.blob = new Blob(fileParts, { type: fileType });
  }

  /**
   * Download the file
   *
   * @param {string} filename Name for file
   * @returns {Promise<void>} Resolves after cleanup has completed
   */
  download(filename) {
    if (!filename) {
      debug(this.filenameRequiredError);
      return Promise.reject(new Error(this.filenameRequiredError));
    }

    debug(`File: initiating download of ${filename}`);
    return new Promise((resolve, reject) => {
      if (browser && browser.downloads) {
        this.url = URL.createObjectURL(this.blob);
        return this.downloadViaApi(this.url, filename);
      }

      debug(this.apiUnavailableError);
      return reject(new Error(this.apiUnavailableError));
    });
  }

  /**
   * Download via the extension API (requires permissions in manifest)
   *
   * @param {string} filename Name of file
   * @param {string} url Url for file
   * @returns {Promise<number>} The download promise resolving the id of the download item
   */
  downloadViaApi(url, filename) {
    if (!url) {
      debug(this.NoDownloadableFileError);
      return Promise.reject(new Error(this.NoDownloadableFileError));
    }

    const { downloads } = browser;
    const { download } = downloads;

    // handle revoking object url here
    downloads.onChanged.addListener(this.onChangedListener);
    return download({ url, filename })
      .then((id) => { this.blobId = id; })
      .catch((err) => {
        browser.downloads.onChanged.removeListener(this.onChangedListener);
        throw err;
      });
  }

  /**
   * OnChanged listener that reports the state of the download item
   *
   * @param {object} delta The delta of download item
   * @returns undefined
   */
  onChangedListener(delta) {
    const hasId = this.blobId && this.blobId === delta.id;
    const isComplete = delta.state && delta.state.current === 'complete';
    if (hasId && isComplete) {
      URL.revokeObjectURL(this.url);
      browser.downloads.onChanged.removeListener(this.onChangedListener);
    }
  }
}

export default File;
