import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import Routes, { Path } from '@routes';
import { AppProvider } from '@contexts/AppContext';
import PrivateBrowsingPage from '@pages/PrivateBrowsingPage';
import FingerprintOptInPage from '@pages/FingerprintOptInPage';

class App extends Component {
  constructor(props) {
    super(props);

    // bindings
    this.history = props.history;
    this.rebuildApp = this.rebuildApp.bind(this);
    this.updateTheme = this.updateTheme.bind(this);
    this.getTheme = this.getTheme.bind(this);
    this.buildContext = this.buildContext.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.updateFirstRun = this.updateFirstRun.bind(this);

    // get app from background page
    const background = browser.extension.getBackgroundPage();
    if (background) { this.app = background.app; }
    else { this.app = window.app; }

    // check if private browsing permission is needed.
    browser.proxy.settings.get({})
      .then(({ value }) => {
        return browser.proxy.settings.set({ value });
      })
      .catch((err) => {
        if (err.toString() === 'Error: proxy.settings requires private browsing permission.') {
          this.setState({ privateRequired: true });
          setTimeout(() => { this.history.push(Path.privateBrowsing); }, 0);
        }
      });

    // check if proxy is controllable
    this.uncontrollable = !this.app.proxy.isControllable();
    if (this.uncontrollable) { setTimeout(() => { this.history.push(Path.uncontrollable); }, 0); }

    // check if this is the first time being run
    this.firstRun = this.app.util.settings.getItem('firstRun', true);

    // check for compatibility
    this.upgrade = !browser.proxy;
    this.upgrade = this.upgrade || !this.app.chromesettings.webrtc.blockable;
    this.upgrade = this.upgrade || !this.app.chromesettings.fingerprintprotection.available;
    this.upgrade = this.upgrade || !this.app.chromesettings.httpreferer.referable;
    this.upgrade = this.upgrade || !this.app.chromesettings.networkprediction.available;
    this.upgrade = this.upgrade || !this.app.chromesettings.hyperlinkaudit.available;
    this.upgrade = this.upgrade || !this.app.chromesettings.trackingprotection.available;
    if (this.upgrade) { setTimeout(() => { this.history.push(Path.upgrade); }, 0); }

    // handle setting theme on extension body
    const theme = this.app.util.settings.getItem('darkTheme') ? 'dark' : 'light';
    if (theme === 'dark') { document.body.classList.add('dark'); }

    // define inital state
    this.state = {
      lastKeyIsCtrl: false,
      firstRun: this.firstRun,
      privateRequired: this.privateRequired,
      context: this.buildContext(theme),
    };

    // add handleKeyDown to keydown listener
    document.addEventListener('keydown', this.handleKeyDown);
  }

  // helper function to updateTheme and context from nested component
  updateTheme(newTheme) {
    if (!(newTheme === 'dark' || newTheme === 'light')) { return; }

    // handle converting string back to boolean
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
      this.app.util.settings.setItem('darkTheme', true);
    }
    else {
      document.body.classList.remove('dark');
      this.app.util.settings.setItem('darkTheme', false);
    }
    // update app
    this.rebuildApp();
  }

  getTheme(){
    const theme = this.app.util.settings.getItem('darkTheme');
    return theme ? 'dark' : 'light';
  }

  updateFirstRun() {
    const firstRun = this.app.util.settings.getItem('firstRun', true);
    this.setState({ firstRun });
  }

  // context builder helper function
  buildContext(newTheme) {
    const {
      app,
      updateTheme,
      getTheme,
      updateFirstRun,
      rebuildApp,
    } = this;
    return {
      app,
      theme: newTheme,
      updateTheme,
      getTheme,
      updateFirstRun,
      rebuildApp,
    };
  }

  rebuildApp() {
    const theme = this.app.util.settings.getItem('darkTheme') ? 'dark' : 'light';
    this.setState({ context: this.buildContext(theme) });
  }

  handleKeyDown(event) {
    const { lastKeyIsCtrl } = this.state;
    const { history, location } = this.props;
    const KEYS = { ctrl: 'Control', d: 'd', rightArrow: 'ArrowRight' };

    // show debug log if ctrl + d
    const ctrlUsed = lastKeyIsCtrl || event.ctrlKey;
    if (ctrlUsed && event.key === KEYS.d) {
      if (location.pathname === Path.debugLog) {
        return history.goBack();
      }
      return history.push(Path.debugLog);
    }

    if (event.ctrlKey && event.shiftKey && event.key === KEYS.rightArrow) {
      if (location.pathname === Path.regionOverride) {
        return history.goBack();
      }
      return history.push(Path.regionOverride);
    }

    // if control was pressed, keep track of that.
    if (event.key === KEYS.ctrl) { return this.setState({ lastKeyIsCtrl: true }); }

    // otherwise reset the ctrl tracker
    return this.setState({ lastKeyIsCtrl: false });
  }

  render() {
    const { context, firstRun, privateRequired } = this.state;

    if (privateRequired) {
      return (
        <AppProvider value={context}>
          <PrivateBrowsingPage />
        </AppProvider>
      );
    }

    return (
      <AppProvider value={context}>
        <Routes />
      </AppProvider>
    );
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(App);
