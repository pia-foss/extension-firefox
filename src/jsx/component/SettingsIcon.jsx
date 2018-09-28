import React, { Component } from 'react';

class SettingsIcon extends Component {
  constructor(props) {
    super(props);

    const background = browser.extension.getBackgroundPage();
    if (background) { this.renderer = background.renderer; }
    else { this.renderer = window.renderer; }

    // bindings
    this.openSettings = this.openSettings.bind(this);
  }

  openSettings() {
    return this.renderer.renderTemplate('settings');
  }

  render() {
    return (
      <div
        title={t('ChangeExtensionSettings')}
        role="button"
        tabIndex="-1"
        className="settings-icon"
        onClick={this.openSettings}
        onKeyPress={this.openSettings}
      >
        <div className="popover darkpopover arrow-bottom">
          { t('ChangeExtensionSettings') }
        </div>
      </div>
    );
  }
}

export default SettingsIcon;
