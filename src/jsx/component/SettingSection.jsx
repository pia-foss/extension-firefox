import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SettingItem from './SettingItem';

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
      settingInfos,
      onSettingChange,
      enabledCount,
      totalCount,
    } = this.props;

    return (
      <div className={`sectionwrapper ${open ? 'open' : 'closed'} ${name}`}>
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
          { settingInfos.map((settingInfo) => {
            if (settingInfo.builder) {
              // Inject component
              const Builder = settingInfo.builder;
              return <Builder key={settingInfo.key} />;
            }
            // Build SettingItem from information
            return (
              <SettingItem
                key={settingInfo.settingID}
                sectionName={name}
                checked={settingInfo.value}
                controllable={settingInfo.controllable}
                disabledValue={settingInfo.disabledValue}
                tooltip={settingInfo.tooltip}
                label={settingInfo.label}
                warning={settingInfo.warning}
                learnMore={settingInfo.learnMore}
                learnMoreHref={settingInfo.learnMoreHref}
                onSettingChange={onSettingChange}
                settingID={settingInfo.settingID}
              />
            );
          })
          }
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
  settingInfos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSettingChange: PropTypes.func.isRequired,
};

export default SettingSection;
