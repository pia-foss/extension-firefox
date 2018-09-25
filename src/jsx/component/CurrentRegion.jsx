import React, { Component } from 'react';
import onFlagError from 'eventhandler/templates/changeregion/onFlagError';

class CurrentRegion extends Component {
  constructor(props) {
    super(props);

    const background = browser.extension.getBackgroundPage();
    if (background) { this.renderer = background.renderer; }
    else { this.renderer = window.renderer; }
    if (background) { this.app = background.app; }
    else { this.app = window.app; }

    // properties
    this.region = this.app.util.regionlist.getSelectedRegion();

    // bindings
    this.changeRegion = this.changeRegion.bind(this);
    this.onFlagLoadError = this.onFlagLoadError.bind(this);
  }

  onFlagLoadError(event) {
    return onFlagError(event, this.region);
  }

  changeRegion() {
    return this.renderer.renderTemplate('change_region');
  }

  render() {
    return (
      <div
        className="current-region"
        role="button"
        tabIndex="-1"
        onClick={this.changeRegion}
        onKeyPress={this.changeRegion}
      >
        <div className="go-forward-image" />

        <div className="flag">
          {
            this.region
              ? <img alt={this.region.iso} onError={this.onFlagLoadError} src={this.region.flag} />
              : <div className="empty-flag" />
          }
        </div>

        <div className="title">
          { t('CurrentRegionText') }
        </div>

        <div className="name">
          {
            this.region
              ? this.region.localizedName()
              : t('NoRegionSelected')
          }
        </div>
      </div>
    );
  }
}

export default CurrentRegion;
