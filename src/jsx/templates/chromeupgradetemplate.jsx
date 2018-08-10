import React, { Component } from 'react';
import CompanyLogo from '../component/companylogo';

export default function (renderer, app) {
  class ChromeUpgradeTemplate extends Component {
    constructor(props) {
      super(props);

      // Properties
      this.windowId = browser.windows.WINDOW_ID_CURRENT;

      // Bindings
      this.closeWindow = this.closeWindow.bind(this);
    }

    closeWindow() {
      browser.windows.remove(this.windowId);
    }

    render() {
      return (
        <div>
          <CompanyLogo />
          <div className="top-border">
            <div className="warningicon" />
            <p className="warningtext">
              { t('UpgradeBrowserMessage', { browser: app.buildinfo.browser }) }
            </p>
            <p className="btn-center">
              <a
                className="btn btn-success"
                href="#"
                onClick={this.closeWindow}
              >
                { t('CloseText') }
              </a>
            </p>
          </div>
        </div>
      );
    }
  }

  return ChromeUpgradeTemplate;
}
