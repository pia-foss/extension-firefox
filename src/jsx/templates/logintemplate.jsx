import React, { Component } from 'react';
import CompanyLogo from '../component/companylogo';
import initLoginForm from '../component/loginform';

export default function (renderer, app, window, document) {
  const LoginForm = initLoginForm(renderer, app, window, document);

  class LoginTemplate extends Component {
    constructor(props) {
      super(props);

      // Properties
      this.url = t('JoinURL');

      // Bindings
      this.joinURL = this.joinURL.bind(this);
    }

    joinURL() {
      let joinURL = this.url;
      if (joinURL.slice(-1) !== '/') { joinURL += '/'; }
      return joinURL + app.buildinfo.coupon;
    }

    render() {
      return (
        <div id="login-template">
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
                className="col-xs-10 btn-info btn-signup"
                target="_blank"
                rel="noopener noreferrer"
                href={this.joinURL}
              >
                { t('JoinText') }
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  return LoginTemplate;
}
