import React, {Component} from 'react';
import PropType from 'prop-types';

import ErrorBoundary from '../../hoc/errorboundary';
import Checkbox from '../checkbox';

class PopularRule extends Component {
  constructor(props) {
    super(props);

    // Bindings
    this.onChange = this.onChange.bind(this);

    // Init
    const {defaultName, app: {util: {bypasslist}}} = props;
    this.state = { checked: bypasslist.isRuleEnabled(defaultName) };
  }

  onChange ({ target: { checked } }) {
    const {defaultName, app: { util: { bypasslist }}} = this.props;
    if (checked) { bypasslist.enablePopularRule(defaultName); }
    else { bypasslist.disablePopularRule(defaultName); }
    this.setState(() => ({ checked: bypasslist.isRuleEnabled(defaultName) }))
  }

  render() {
    const {defaultName} = this.props;
    return (
      <li className="list-group-item col-xs-4 popular-rule">
        <label
            htmlFor={defaultName}
            className="noselect col-xs-8 popular-rule-name">
          {defaultName}
        </label>
          <Checkbox
            id={defaultName}
            className="col-xs-2"
            checked={this.state.checked}
            onChange={this.onChange}
          />
      </li>
    );
  }
}

PopularRule.propTypes = {
  defaultName: PropType.string.isRequired,
  app: PropType.object.isRequired,
};

export default ErrorBoundary(PopularRule);
