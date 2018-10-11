import PropType from 'prop-types';
import React, { Component } from 'react';
import Tooltip from 'component/Tooltip';
import UncontrolledCheckbox from './UncontrolledCheckbox';

/**
 * Checkbox to toggle where user credentials are stored (memory/localStorage)
 *
 * Only one of these should exist on the view at a time
 */
class RememberMeCheckbox extends Component {
  constructor(props) {
    super(props);

    const background = browser.extension.getBackgroundPage();
    if (background) { this.app = background.app; }
    else { this.app = window.app; }

    // properties
    this.user = this.app.util.user;
    this.settings = this.app.util.settings;
    this.rememberMe = this.settings.getItem('rememberme');

    // bindings
    this.onChange = this.onChange.bind(this);
  }

  onChange(checked) {
    this.user.setRememberMe(checked);
  }

  render() {
    const { labelLocaleKey } = this.props;

    return (
      <div className="remember-me-container">
        <UncontrolledCheckbox
          id="remember-checkbox"
          defaultChecked={this.rememberMe}
          onChange={this.onChange}
          className="popover-trigger"
        />
        <label
          htmlFor="remember-checkbox"
          className="checkbox-label popover-trigger"
        >{ t(labelLocaleKey) }
        </label>
        <Tooltip
          message={t('RememberMeTooltip')}
          orientation="right"
        />
      </div>
    );
  }
}

RememberMeCheckbox.propTypes = {
  labelLocaleKey: PropType.string.isRequired,
};

export default RememberMeCheckbox;
