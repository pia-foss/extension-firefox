import initPageTitle            from 'component/pagetitle';
import initBypassSettingSection from 'component/bypasslist/settingsection';
import initSettingSection       from 'component/settingsection';
import initSettingItem          from 'component/settingitem';
import initDebugSettingItem     from 'component/debugsettingitem';
import initLanguageDropdown     from 'component/languagedropdown';

export default function(renderer, app, window, document) {
  const React           = renderer.react;
  const PageTitle       = initPageTitle(renderer, app, window, document);
  const BypassSettingSection = initBypassSettingSection(renderer, app, window, document);
  const SettingSection  = initSettingSection(renderer, app, window, document);
  const SettingItem     = initSettingItem(renderer, app, window, document);
  const DebugSettingItem = initDebugSettingItem(renderer, app, window, document);
  const LanguageDropdown = initLanguageDropdown(renderer, app, window, document);
  const {chromesettings, contentsettings} = app;
  const {proxy} = app;
  const {settings, regionlist} = app.util;

  return class extends React.Component {
    render() {
      return (
        <div id="settings-template" className="row">
          <div className="top-border" id="settings">
            <PageTitle previousTemplate="authenticated" text={t("ChangeExtensionSettings")}/>
            {this.warningDiv()}
            <div className="sectionwrapper security">
              <SettingSection label={t("Security")}>
                <SettingItem
                    id={chromesettings.webrtc.settingID}
                    controllable={chromesettings.webrtc.isControllable()}
                    label={t("WebRTCLeakProtection")}
                    tooltip={t("WebRTCTooltip", {browser: app.buildinfo.browser})}
                    setting={chromesettings.webrtc}
                />
              </SettingSection>
            </div>
            <div className="sectionwrapper privacy">
              <SettingSection label={t('Privacy')}>
                  <SettingItem
                      id={chromesettings.networkprediction.settingID}
                      controllable={chromesettings.networkprediction.isControllable()}
                      label={t("BlockNetworkPrediction")}
                      tooltip={t("BlockNetworkPredictionTooltip", {browser: app.buildinfo.browser})}
                      setting={chromesettings.networkprediction}
                  />
              </SettingSection>
            </div>
            <div className="sectionwrapper tracking">
              <SettingSection label={t("Tracking")}>
                <SettingItem
                  id={chromesettings.trackingprotection.settingID}
                  controllable={chromesettings.trackingprotection.isControllable()}
                  label={t("TrackingProtection")}
                  tooltip={t("TrackingProtectionTooltip")}
                  setting={chromesettings.trackingprotection}
                />
                <SettingItem
                  id={chromesettings.fingerprintprotection.settingID}
                  controllable={chromesettings.fingerprintprotection.isControllable()}
                  label={t("FingerprintProtection")}
                  tooltip={t("FingerprintProtectionTooltip", {browser: app.buildinfo.browser})}
                  setting={chromesettings.fingerprintprotection}
                />
                <SettingItem
                  id={chromesettings.httpreferer.settingID}
                  controllable={chromesettings.httpreferer.isControllable()}
                  label={t("BlockHTTPReferer")}
                  tooltip={t("BlockHTTPRefererTooltip", {browser: app.buildinfo.browser})}
                  setting={chromesettings.httpreferer}
                />
                <SettingItem
                  id={chromesettings.hyperlinkaudit.settingID}
                  controllable={chromesettings.hyperlinkaudit.isControllable()}
                  label={t("BlockHyperlinkAuditing")}
                  tooltip={t("BlockHyperlinkAuditingTooltip")}
                  setting={chromesettings.hyperlinkaudit}
                />
                <SettingItem
                  id="blockutm"
                  label={t("BlockUTM")}
                  tooltip={t("BlockUTMTooltip")}
                />
                <SettingItem
                  id="maceprotection"
                  label={t("MaceProtection")}
                  tooltip={t("MaceTooltip")}
                  learnMore={t("WhatIsMace")}
                  learnMoreHref={"https://www.privateinternetaccess.com/helpdesk/kb/articles/what-is-mace"}
                />
              </SettingSection>
            </div>
            <div className="sectionwrapper developer">
              <SettingSection label={t("Extension")}>
                <SettingItem
                    id="debugmode"
                    label={t("DebugMode")}
                    tooltip={t("DebugModeTooltip")}
                />

                <DebugSettingItem />

                <div style={{color: "#333 !important"}} className='field settingitem noselect'>
                  <div className='col-xs-6 settingblock'>
                    <a className="macetooltip">
                      <label htmlFor="languages">
                        {t("UILanguage")}
                        <div className="popover arrow-bottom">{t("UILanguageTooltip")}</div>
                      </label>
                    </a>
                  </div>
                  <div className="col-xs-6 checkbox-container">
                    <LanguageDropdown/>
                  </div>
                </div>
              </SettingSection>
            </div>
            <div className="sectionwrapper bypass">
              <BypassSettingSection/>
            </div>
            <div className='field panelfooter'>
              <div className='col-xs-12 settingblock'>
                v{app.buildinfo.version} (<a href="#" onClick={() => renderer.renderTemplate("changelog")}>View Changelog</a>)
                {this.gitInfo()}
              </div>
            </div>
          </div>
        </div>
      )
    }

    warningDiv() {
      const regionName = regionlist.getSelectedRegion().localizedName()
      if(proxy.enabled())
        return (
          <div className="settingswarning-connected noselect">
            {t("SettingsWarningConnected", {browser: app.buildinfo.browser, region: regionName})}
          </div>
        )
      else
        return (
          <div className="settingswarning-disconnected noselect">
            {t("SettingsWarning")}
          </div>
        )
    }

    gitInfo() {
      const {gitcommit,gitbranch} = app.buildinfo
      if([gitcommit,gitbranch].filter((e) => e && /^[a-zA-Z0-9\-.]+$/.test(e)).length === 2)
        return (
          <div className="gitinfo">
            <div className="row">
              <span className="branch col-xs-2">Branch</span>
              <span className="gitbranch">{gitbranch}</span>
            </div>
            <div className="row">
              <span className="commit col-xs-2">Commit</span>
              <span className="gitcommit">{gitcommit}</span>
            </div>
          </div>
        )
    }
  }
}
