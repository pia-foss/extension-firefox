import React, { Component } from 'react';
import CompanyLogo from '../component/companylogo';

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
        <div>
          <CompanyLogo />

          <div className="top-border">
            <div className="warningicon" />

            <p className="warningtext">
              { t('CannotUsePIAMessage') }
            </p>

            <p className="btn-center">
              <a
                className="btn btn-success"
                href="#"
                onClick={this.openExtensionsPage}
              >
                { t('ManageExtensions') }
              </a>
            </p>
          </div>
        </div>
      );
    }
  }

  return UncontrollableTemplate;
}
