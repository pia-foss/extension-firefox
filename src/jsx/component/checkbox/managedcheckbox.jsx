import React, {Component} from 'react';
import PropType from 'prop-types';

import Checkbox from '.';
import bind from '../../../js/helpers/bind';
import remove from '../../../js/helpers/remove';

class ManagedCheckbox extends Component {
  constructor (props) {
    super(props);

    // Bindings
    this.onChange = bind(this.onChange, this);

    // Init
    const checked = typeof props.defaultChecked === 'undefined' ? false : props.defaultChecked;
    this.state = {checked};
  }

  onChange () {
    this.setState(({checked}) => ({checked: !checked}));
  }

  extractCheckboxProps (props) {
    return remove(props, 'onChange', 'defaultChecked');
  }

  componentDidUpdate (prevState) {
    if (prevState.checked !== this.state.checked) {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(this.state.checked);
      }
    }
  }

  render () {
    return <Checkbox {...this.extractCheckboxProps(this.props)} checked={this.state.checked} onChange={this.onChange} />;
  }
}

ManagedCheckbox.propTypes = {
  defaultChecked: PropType.bool,
  onChange: PropType.func,
}

export default ManagedCheckbox;
