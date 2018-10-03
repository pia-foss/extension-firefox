import PropTypes from 'prop-types';
import React, { Component } from 'react';

class SettingSection extends Component {
  constructor(props) {
    super(props);

    // Bindings
    this.toggleSection = this.toggleSection.bind(this);

    // Initialization
    this.state = { open: false };
  }

  toggleSection() {
    const { open } = this.state;
    this.setState({ open: !open });
  }

  render() {
    const { open } = this.state;
    const {
      name,
      label,
      enabledCount,
      totalCount,
      children,
    } = this.props;

    const sectionClassList = [
      'sectionwrapper',
      open ? 'open' : 'closed',
      name,
    ];

    return (
      <div className={sectionClassList.join(' ')}>
        <div
          role="button"
          tabIndex="-1"
          className="firstfield field"
          onClick={this.toggleSection}
          onKeyPress={this.toggleSection}
        >
          <div className="col-xs-12 settingblock settingheader noselect">
            <span className="sectiontitle col-xs-6">
              { label }
            </span>

            <div className="rightalign">
              <span className="counts">
                { enabledCount }
                /
                { totalCount }
                &nbsp;
                { t('enabled') }
              </span>

              <span className="expandicon" />
            </div>
          </div>
        </div>
        <div className="SettingItemContainer">
          { children }
        </div>
      </div>
    );
  }
}

SettingSection.propTypes = {
  enabledCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default SettingSection;
