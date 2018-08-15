import React, { Component } from 'react';
import Switch from '../component/switch';
import CompanyLogo from '../component/companylogo';
import initCurrentRegion from '../component/currentregion';
import initActionButton from '../component/actionbutton';
import initSettingsIcon from '../component/settingsicon';

export default function (renderer, app, window, document) {
  const CurrentRegion = initCurrentRegion(renderer, app, window, document);
  const ActionButton = initActionButton(renderer, app, window, document);
  const SettingsIcon = initSettingsIcon(renderer, app, window, document);
  const { regionlist, user } = app.util;

  const logout = () => {
    return user.logout(() => {
      return renderer.renderTemplate('login');
    });
  };

  return class extends Component {
    constructor(props) {
      super(props);
      this.i18n = app.util.i18n;
      this.state = { region: regionlist.getSelectedRegion() };

      this.autologinURL = this.autologinURL.bind(this);
    }

    autologinURL() {
      return `https://${this.i18n.domain()}/xpages/sign-in`;
    }

    render() {
      const { region } = this.state;
      return (
        <div id="authenticated-template" className="row">
          <CompanyLogo />

          <div className="connection">
            <div>
              <Switch app={app} />
            </div>

            <div>
              <CurrentRegion id="region" region={region} />
            </div>

            <div className="external-buttons">
              <SettingsIcon />

              <a
                title={t('AccountSettingsText')}
                className="col-xs-4 btn-icon btn-account invokepop"
                href={this.autologinURL()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="popover darkpopover arrow-bottom">
                  { t('AccountSettingsText') }
                </div>
              </a>

              <a
                title={t('SupportText')}
                className="col-xs-4 btn-icon btn-help"
                href="https://www.privateinternetaccess.com/helpdesk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="popover darkpopover arrow-bottom">
                  { t('SupportText') }
                </div>
              </a>

              <ActionButton
                extraClassList="col-xs-3 btn-icon btn-logout"
                title={t('LogoutText')}
                tooltip={t('LogoutText')}
                callback={logout}
              />
            </div>
          </div>
        </div>
      );
    }
  };
}
