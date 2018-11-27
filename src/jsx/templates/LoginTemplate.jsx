import React, { Component } from 'react';
import PropTypes from 'prop-types';

import listenOnline from 'hoc/listenOnline';
import LoginForm from '../component/LoginForm';
import CompanyLogo from '../component/CompanyLogo';
import OfflineWarning from '../component/OfflineWarning';

export default function () {
  class LoginTemplate extends Component {
    constructor(props) {
      super(props);

      const background = browser.extension.getBackgroundPage();
      if (background) { this.app = background.app; }
      else { this.app = window.app; }

      // bindings
      this.joinURL = this.joinURL.bind(this);
    }

    joinURL() {
      let joinURL = t('JoinURL');
      if (joinURL.slice(-1) !== '/') { joinURL += '/'; }
      return joinURL + this.app.buildinfo.coupon;
    }

    render() {
      const { props: { online } } = this;

      return (
        <div id="login-template" className="row">
          <OfflineWarning />

          <CompanyLogo />

          <div className="top-border">
            <LoginForm />
          </div>

          <div className="top-border">
            <div className="text-center dont-have-an-account">
              { t('NoAccountQuestion') }
            </div>

            <div className="join-PIA">
              <div className="col-xs-1" />

              <a
                target="_blank"
                rel="noopener noreferrer"
                href={online ? this.joinURL() : undefined}
                className={[
                  'col-xs-10',
                  'btn-info',
                  'btn-signup',
                  ...(online ? [] : ['disabled']),
                ].join(' ')}
              >
                { t('JoinText') }
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  LoginTemplate.propTypes = {
    online: PropTypes.bool.isRequired,
  };

  return listenOnline(LoginTemplate);
}
