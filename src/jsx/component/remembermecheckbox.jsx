import React, {Component} from 'react';
import PropType from 'prop-types';

import Checkbox from './checkbox';
import bind from '../../js/helpers/bind';
import remove from '../../js/helpers/remove';

class RememberMeCheckbox extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.onChange = bind(this.onChange, this);

    // Init
    const {remember, name, app: {util: {settings}}} = props;
    this.state = {
      checked: remember && settings.getItem(name),
    };
  }

  onChange () {
    const {storage, settings} = this.props.app.util;
    if(e.target.checked) {
      /* Copy the username and password stored in memory to localStorage */
      storage.setItem("form:username", storage.getItem("form:username", "memoryStorage"), "localStorage")
      storage.setItem("form:password", storage.getItem("form:password", "memoryStorage"), "localStorage")
      /* Forget the username and password stored in memory */
      storage.removeItem("form:username", "memoryStorage")
      storage.removeItem("form:password", "memoryStorage")
      this.setState(() => ({checked: true}))
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
      this.setState(() => ({checked: false}))
      settings.setItem("rememberme", false)
    }
  }

  extractCheckboxProps () {
    return remove(this.props, 'remember', 'app');
  }

  render () {
    return (
      <Checkbox
        onChange={this.onChange}
        {...this.extractCheckboxProps()}
      />
    )
  }
}

RememberMeCheckbox.propTypes = {
  remember: PropType.bool,
  name: PropType.string,
  app: PropType.object.isRequired,
  labelLocaleKey: PropType.string,
}

export default RememberMeCheckbox;
