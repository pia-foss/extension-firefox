import React from 'react';
import ReactDOM from 'react-dom';
import LoginTemplate from '../templates/logintemplate';
import AuthenticatedTemplate from '../templates/authenticatedtemplate';
import ChangeRegionTemplate from '../templates/changeregiontemplate';
import SettingsTemplate from '../templates/settingstemplate';
import ChromeUpgradeTemplate from '../templates/chromeupgradetemplate';
import PleaseWaitTemplate from '../templates/pleasewaittemplate';
import UncontrollableTemplate from '../templates/uncontrollabletemplate';
import ChangelogTemplate from '../templates/changelogtemplate';
import DebugLogTemplate from '../templates/debuglogtemplate';
import BypassListTemplate from '../templates/bypasslisttemplate';
import FingerprintOptIn from '../templates/fingerprint-opt-in';

export default class Renderer {
  constructor(app, window, document) {
    // TODO: remove ref to React when components are more stable
    this.react = React;
    this.currentTemplate = undefined;
    this.previousTemplate = undefined;
    this.templates = {
      login: () => { return LoginTemplate(this, app, window, document); },
      authenticated: () => { return AuthenticatedTemplate(this, app, window, document); },
      change_region: () => { return ChangeRegionTemplate(this, app, window, document); },
      settings: () => { return SettingsTemplate(this, app, window, document); },
      upgrade_chrome: () => { return ChromeUpgradeTemplate(this, app); },
      please_wait: () => { return PleaseWaitTemplate(); },
      uncontrollable: () => { return UncontrollableTemplate(); },
      changelog: () => { return ChangelogTemplate(this, app, window, document); },
      debuglog: () => { return DebugLogTemplate(this, app, window, document); },
      bypasslist: () => { return BypassListTemplate(this, app, window, document); },
      fingerprint: () => { return FingerprintOptIn(this, app); },
    };

    // bindings
    this.renderTemplate = this.renderTemplate.bind(this);
  }

  renderTemplate(templateName, customNode) {
    try {
      const template = this.templates[templateName];

      if (template) {
        this.previousTemplate = this.currentTemplate;
        this.currentTemplate = templateName;
        const newNode = customNode || document.getElementById('template-content');
        ReactDOM.render(React.createElement(template()), newNode);
      }
    }
    /**
     * NOTE: This will catch any initial rendering bugs that might come about from the
     * background process dying and leaving the foreground unusable. Closing the window
     * and bringing it back up should retrieve the new background process. Do not use the
     * browser.windows API here since it will close the browser rather than the extension.
     */
    catch (err) { window.close(); }
  }
}
