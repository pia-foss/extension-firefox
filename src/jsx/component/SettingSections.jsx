import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';

import {
  createSettingsData,
  getSetting,
  getEnabledCount,
  getTotalCount,
} from 'data/settings';
import { createSectionsData, getSection } from 'data/sections';
import SettingSection from './SettingSection';
import SettingItem from './SettingItem';
import DebugSettingItem from './DebugSettingItem';

class SettingSections extends Component {
  constructor(props) {
    super(props);

    const background = browser.extension.getBackgroundPage();
    if (background) { this.app = background.app; }
    else { this.app = window.app; }

    // Bindings
    this.onSettingChange = this.onSettingChange.bind(this);
    this.getSectionProps = this.getSectionProps.bind(this);
    this.getSettingProps = this.getSettingProps.bind(this);

    // Initialization
    const { settings, user } = this.app.util;
    const { browser: browserType } = this.app.buildinfo;
    this.state = {
      sectionsData: createSectionsData({ t }),
      settingsData: createSettingsData({
        t,
        user,
        settings,
        browser: browserType,
      }),
    };
  }

  onSettingChange(settingID, value) {
    this.setState(({ settingsData }) => {
      return {
        settingsData: settingsData.map((setting) => {
          if (setting.settingID === settingID) {
            return Object.assign({}, setting, {
              value,
            });
          }

          return setting;
        }),
      };
    });
  }

  getSectionProps(sectionKey) {
    const { sectionsData, settingsData } = this.state;
    const { name, label } = getSection(sectionKey, sectionsData);
    const enabledCount = getEnabledCount(sectionKey, settingsData);
    const totalCount = getTotalCount(sectionKey, settingsData);

    return {
      name,
      label,
      enabledCount,
      totalCount,
    };
  }

  getSettingProps(settingID) {
    const { settingsData } = this.state;
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
      available,
      onSettingChange: this.onSettingChange,
    };
  }

  render() {
    const {
      props: { onDebugClick, languageDropdownBuilder },
      state: { settingsData },
    } = this;

    return (
      <Fragment>
        <SettingSection {...this.getSectionProps('security')}>
          <SettingItem {...this.getSettingProps('preventwebrtcleak')} />
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
          <SettingItem {...this.getSettingProps('maceprotection')} />
        </SettingSection>
        <SettingSection {...this.getSectionProps('extension')}>
          <SettingItem {...this.getSettingProps('logoutOnClose')} />
          <SettingItem {...this.getSettingProps('debugmode')} />
          { getSetting('debugmode', settingsData).value
            && <DebugSettingItem onClick={onDebugClick} />
          }
          { languageDropdownBuilder() }
        </SettingSection>
      </Fragment>
    );
  }
}

SettingSections.propTypes = {
  onDebugClick: PropTypes.func.isRequired,
  languageDropdownBuilder: PropTypes.func.isRequired,
};

export default SettingSections;
