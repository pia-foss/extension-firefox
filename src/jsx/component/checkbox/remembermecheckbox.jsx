import React, {Component} from 'react';
import PropType from 'prop-types';

import UncontrolledCheckbox from './uncontrolledcheckbox';

/**
 * Checkbox to toggle where user credentials are stored (memory/localStorage)
 *
 * Only one of these should exist on the view at a time
 */
class RememberMeCheckbox extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.onChange = this.onChange.bind(this);

    // Init
    const {remember, app: {util: {settings}}} = props;
    this.defaultChecked = remember && settings.getItem('rememberme');
  }

  onChange (checked) {
    const {storage, settings} = this.props.app.util;
    if(checked) {
      /* Copy the username and password stored in memory to localStorage */
      storage.setItem("form:username", storage.getItem("form:username", "memoryStorage"), "localStorage")
      storage.setItem("form:password", storage.getItem("form:password", "memoryStorage"), "localStorage")
      /* Forget the username and password stored in memory */
      storage.removeItem("form:username", "memoryStorage")
      storage.removeItem("form:password", "memoryStorage")
      settings.setItem("rememberme", true)
    }
    else {
      /* Copy the username and password stored in localStorage to memory */
      const username = storage.getItem("form:username", "localStorage"),
            password = storage.getItem("form:password", "localStorage")
      if(typeof(username) === "string" && username.length > 0 && typeof(password) === "string" && password.length > 0) {
        storage.setItem("form:username", username, "memoryStorage")
        storage.setItem("form:password", password, "memoryStorage")
      }
      /* Forget the username and password stored in localStorage */
      storage.removeItem("form:username", "localStorage")
      storage.removeItem("form:password", "localStorage")
      settings.setItem("rememberme", false)
    }
  }

  render () {
    return (
      <div className={`remember-me-container`}>
        <UncontrolledCheckbox
          defaultChecked={this.defaultChecked}
          onChange={this.onChange}
          id="remember-checkbox"
        />
        <label htmlFor="remember-checkbox">{t(this.props.labelLocaleKey)}</label>
      </div>
    )
  }
}

RememberMeCheckbox.propTypes = {
  remember: PropType.bool,
  app: PropType.object.isRequired,
  labelLocaleKey: PropType.string.isRequired,
}

export default RememberMeCheckbox;
