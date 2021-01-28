import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import {
  createSettingsData,
  getSetting,
  getTotalCount,
  getEnabledCount,
} from '@data/settings';
import withAppContext from '@hoc/withAppContext';
import { createSectionsData, getSection } from '@data/sections';
import SettingItem from '@component/SettingItem';
import SettingSection from '@component/SettingSection';
import LanguageDropdown from '@component/LanguageDropdown';

class OnboardingSettings extends Component {
  constructor(props) {
    super(props);

    // properties
    this.app = props.context.app;
    this.languageDropdown = LanguageDropdown;
    const { settings } = this.app.util;
    this.state = {
      sectionsData: createSectionsData({ t },[true,false,false,false]),
      settingsData: createSettingsData({ t, settings }),
    };

    // bindings
    this.updateLanguage = this.updateLanguage.bind(this);
    this.onSettingChange = this.onSettingChange.bind(this);
    this.getSectionProps = this.getSectionProps.bind(this);
    this.getSettingProps = this.getSettingProps.bind(this);
    this.languageDropdownBuilder = this.languageDropdownBuilder.bind(this);
  }

  onSettingChange(settingID, value) {
    this.setState(({ settingsData }) => {
      return {
        settingsData: settingsData.map((setting) => {
          if (setting.settingID === settingID) {
            return Object.assign({}, setting, { value });
          }

          return setting;
        }),
      };
    });
  }

  getSectionProps(sectionKey) {
    const { sectionsData, settingsData } = this.state;
    const { name, label, defaultOpen } = getSection(sectionKey, sectionsData);
    const enabledCount = getEnabledCount(sectionKey, settingsData);
    const totalCount = getTotalCount(sectionKey, settingsData);

    return {
      name,
      label,
      defaultOpen,
      enabledCount,
      totalCount,
    };
  }

  getSettingProps(settingID) {
    const { settingsData } = this.state;
    const { changeTheme } = this.props;
    const {
      value,
      controllable,
      tooltip,
      label,
      warning,
      learnMore,
      learnMoreHref,
      section,
      available,
    } = getSetting(settingID, settingsData);

    return {
      settingID,
      controllable,
      tooltip,
      label,
      warning,
      learnMore,
      learnMoreHref,
      sectionName: section,
      key: settingID,
      checked: value,
      changeTheme,
      onSettingChange: this.onSettingChange,
      available,
      component:'switch'
    };
  }

  updateLanguage() {
    const { settings } = this.app.util;
    this.setState({
      sectionsData: createSectionsData({ t },[true,false,false,false]),
      settingsData: createSettingsData({ t, settings }),
    });
  }

  languageDropdownBuilder() {
    const theme = this.props.context.getTheme();
    const LanguageDropDown = this.languageDropdown;

    return (
      <div className={`setting-item ${theme} noselect`}>
        <div className="setting-item-label">
          <label htmlFor="languages" className="controllable-setting languages noselect">
            { t('UILanguage') }
            <div className={`popover arrow-bottom ${theme} left-align`}>
              { t('UILanguageTooltip') }
            </div>
          </label>
        </div>
        <div className="checkbox-container">
          <LanguageDropDown updateLanguage={this.updateLanguage} />
        </div>
      </div>
    );
  }

  render() {

    return (
      <Fragment>
        <SettingSection {...this.getSectionProps('security')}>
          <SettingItem {...this.getSettingProps('preventwebrtcleak')} />
          <SettingItem {...this.getSettingProps('httpsUpgrade')} />
        </SettingSection>
        <SettingSection {...this.getSectionProps('privacy')}>
          <SettingItem {...this.getSettingProps('blocknetworkprediction')} />
        </SettingSection>
        <SettingSection {...this.getSectionProps('tracking')}>
          <SettingItem {...this.getSettingProps('trackingprotection')} />
          <SettingItem {...this.getSettingProps('fingerprintprotection')} />
          <SettingItem {...this.getSettingProps('blockreferer')} />
          <SettingItem {...this.getSettingProps('blockhyperlinkaudit')} />
          <SettingItem {...this.getSettingProps('blockutm')} />
          <SettingItem {...this.getSettingProps('blockfbclid')} />
          <SettingItem {...this.getSettingProps('maceprotection')} />
        </SettingSection>
      </Fragment>
    );
  }
}

OnboardingSettings.propTypes = {
  context: PropTypes.object.isRequired,
  changeTheme: PropTypes.func.isRequired,
  onDebugClick: PropTypes.func.isRequired,
};

export default withAppContext(OnboardingSettings);
