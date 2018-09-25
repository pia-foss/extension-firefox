import React, { Component } from 'react';

class BypassSettingSection extends Component {
  constructor(props) {
    super(props);

    const background = browser.extension.getBackgroundPage();
    if (background) { this.renderer = background.renderer; }
    else { this.renderer = window.renderer; }
    if (background) { this.app = background.app; }
    else { this.app = window.app; }

    // properties
    this.bypasslist = this.app.util.bypasslist;

    // bindings
    this.renderBypassTemplate = this.renderBypassTemplate.bind(this);
  }

  renderBypassTemplate() {
    return this.renderer.renderTemplate('bypasslist');
  }

  render() {
    let listDetails = '';
    const count = this.bypasslist.visibleSize();

    if (count === 0) { listDetails = t('NoRulesAdded'); }
    else if (count === 1) { listDetails = t('OneRuleAdded'); }
    else { listDetails = t('MultipleRulesAdded', { count }); }

    return (
      <div className="setting-section">
        <div
          role="button"
          tabIndex="-1"
          className="firstfield field"
          onClick={this.renderBypassTemplate}
          onKeyPress={this.renderBypassTemplate}
        >
          <div className="col-xs-12 settingblock settingheader noselect">
            <span className="sectiontitle col-xs-6">
              { t('ProxyBypassList') }
            </span>

            <div className="rightalign">
              <span className="counts">
                { listDetails }
              </span>

              <span className="expandicon lefticon" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BypassSettingSection;
