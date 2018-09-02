import React, { Component } from 'react';
import OfflineWarning from '../component/OfflineWarning';
import CompanyLogo from '../component/CompanyLogo';

export default function () {
  class UncontrollableTemplate extends Component {
    constructor(props) {
      super(props);

      // Properties
      this.extensionsUrl = 'chrome://extensions';

      // Bindings
      this.openExtensionsPage = this.openExtensionsPage.bind(this);
    }

    openExtensionsPage() {
      chrome.tabs.create({ url: this.extensionsUrl });
    }

    render() {
      return (
        <div className="uncontrollable-template row">
          <OfflineWarning />

          <CompanyLogo />

          <div className="top-border">
            <div className="warningicon" />

            <p className="warningtext">
              { t('CannotUsePIAMessage') }
            </p>

            <p className="btn-center">
              <button
                type="button"
                className="btn btn-success"
                onClick={this.openExtensionsPage}
              >
                { t('ManageExtensions') }
              </button>
            </p>
          </div>
        </div>
      );
    }
  }

  return UncontrollableTemplate;
}
